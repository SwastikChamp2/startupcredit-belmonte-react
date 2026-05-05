import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import AdminPagination from './AdminPagination'
import useAdminPagination from './useAdminPagination'
import { PROJECT_STATUSES, getProjects, updateProject } from './adminProjectData'

function getStatusClass(status) {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function isProjectCompleted(status) {
  return status === 'Project Completed'
}

function createHistoryEntry(actionDescription) {
  const now = new Date()
  const dateOptions = { month: 'long' }
  const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true }
  
  const day = now.getDate()
  const suffix = ["th", "st", "nd", "rd"][((day % 100) - 20) % 10] || ["th", "st", "nd", "rd"][day % 100] || "th"
  const dateStr = `${day}${suffix} ${now.toLocaleDateString('en-US', dateOptions)}`

  return {
    id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    action: `admin@startupcredit.in ${actionDescription}`,
    date: dateStr,
    time: now.toLocaleTimeString('en-US', timeOptions),
  }
}

function AdminProjects() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const navigate = useNavigate()
  const [projects, setProjects] = useState(() => getProjects())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('desc')
  const [lockedStatusProject, setLockedStatusProject] = useState(null)

  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'Today' || dateStr === '-') return Number.MAX_SAFE_INTEGER
    return new Date(dateStr).getTime()
  }

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    const filtered = projects.filter((project) => {
      const matchesStatus = statusFilter === 'All' || project.status === statusFilter
      const matchesSearch =
        !query ||
        project.projectTitle.toLowerCase().includes(query) ||
        project.clientName.toLowerCase().includes(query) ||
        project.clientEmail.toLowerCase().includes(query) ||
        project.nicCode.toLowerCase().includes(query)

      return matchesStatus && matchesSearch
    })

    return filtered.sort((a, b) => {
      const timeA = parseDate(a.lastUpdated)
      const timeB = parseDate(b.lastUpdated)
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
    })
  }, [projects, searchTerm, statusFilter, sortOrder])
  const projectsPagination = useAdminPagination(filteredProjects)

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const handleStatusChange = (projectId, newStatus) => {
    const project = projects.find((currentProject) => currentProject.id === projectId)

    if (!project || isProjectCompleted(project.status)) {
      setLockedStatusProject(project || null)
      return
    }

    updateProject(projectId, (p) => ({
      ...p,
      status: newStatus,
      lastUpdated: 'Today',
      history: [
        ...(p.history || []),
        createHistoryEntry(`changed status to "${newStatus}" from the list view`),
      ],
    }))
    setProjects(getProjects())
  }

  return (
    <AdminShell
      title="Project Management"
      subtitle="Manage active client projects and track their progress."
    >
      <section className="admin-users-card admin-projects-card">
        <div className="admin-users-toolbar admin-projects-toolbar">
          <label className="admin-users-search admin-inquiry-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input
              aria-label="Search active projects"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by project title, client, email, or NIC code..."
              type="search"
              value={searchTerm}
            />
          </label>

          <select
            aria-label="Filter by project status"
            className="admin-filter-select admin-project-status-filter"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option value="All">All Status</option>
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="admin-users-table-wrap">
          <table className="admin-users-table admin-projects-table">
            <thead>
              <tr>
                <th>Submitted By</th>
                <th>Project / Client</th>
                <th>NIC Code</th>
                <th>Status</th>
                <th>
                  Last Updated{' '}
                  <button
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
                    aria-label="Toggle sort order"
                    type="button"
                  >
                    <i className={`fa-solid fa-arrow-${sortOrder === 'desc' ? 'down' : 'up'}`} aria-hidden="true" style={{ color: 'var(--text-light)' }}></i>
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projectsPagination.paginatedItems.map((project) => (
                <tr key={project.id}>
                  <td>
                    <div className="admin-project-cell">
                      {project.submittedByType === 'Business Associate' ? (
                        <>
                          <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Business Associate</span>
                          <strong>{project.associateName}</strong>
                          <span>{project.associateEmail}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--success-color, #16a34a)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Self</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="admin-project-cell">
                      <strong>{project.projectTitle}</strong>
                      <span>{project.clientName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-project-cell">
                      <strong>{project.nicCode}</strong>
                      <span>{project.nicName}</span>
                    </div>
                  </td>
                  <td>
                    <select
                      className={`admin-project-status ${getStatusClass(project.status)}`}
                      value={project.status}
                      onChange={(e) => handleStatusChange(project.id, e.target.value)}
                      title={isProjectCompleted(project.status) ? 'Completed projects are locked' : 'Update project status'}
                      style={{ border: 'none', cursor: isProjectCompleted(project.status) ? 'not-allowed' : 'pointer', appearance: 'auto' }}
                    >
                      {PROJECT_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>{project.lastUpdated}</td>
                  <td>
                    <div className="admin-user-actions">
                      <button
                        onClick={() => navigate(`/admin/projects/${project.id}`)}
                        type="button"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProjects.length === 0 && (
            <div className="admin-users-empty">
              <i className="fa-regular fa-folder-open" aria-hidden="true"></i>
              <strong>No active projects found</strong>
              <span>Try changing the search or status filter.</span>
            </div>
          )}
        </div>

        <AdminPagination
          {...projectsPagination}
          itemLabel="projects"
          totalRecords={projects.length}
        />
      </section>

      {lockedStatusProject && (
        <div className="admin-modal-backdrop" role="presentation">
          <section
            aria-labelledby="project-locked-title"
            aria-modal="true"
            className="admin-modal admin-confirm-modal"
            role="dialog"
          >
            <header className="admin-modal-header">
              <div>
                <p>Project Completed</p>
                <h2 id="project-locked-title">Status locked</h2>
              </div>
              <button
                aria-label="Close status locked message"
                onClick={() => setLockedStatusProject(null)}
                type="button"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </header>
            <div className="admin-modal-body">
              <div className="admin-detail-block">
                <strong>{lockedStatusProject.projectTitle}</strong>
                <p>This project is marked completed, so its status cannot be changed further.</p>
              </div>
              <div className="admin-modal-actions">
                <button className="admin-link-button" onClick={() => setLockedStatusProject(null)} type="button">
                  Okay
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  )
}

export default AdminProjects
