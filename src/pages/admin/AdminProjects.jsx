import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import AdminPagination from './AdminPagination'
import AdminStatusDropdown from './AdminStatusDropdown'
import useAdminPagination from './useAdminPagination'
import { PROJECT_STATUSES } from './adminProjectData'
import {
  adaptProjectForAdmin,
  updateAdminProjectSubmission,
} from '../../services/adminDataApi'
import { useFirestoreCollection } from '../../hooks/useFirestoreSnapshot'

// Submissions still in inquiry phase don't appear in the project workflow.
const INQUIRY_STATUSES = new Set(['Inquiry Pending'])

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
  const [errorMsg, setErrorMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('desc')
  const [lockedStatusProject, setLockedStatusProject] = useState(null)
  const [openStatusProjectId, setOpenStatusProjectId] = useState(null)
  const [pendingCompletion, setPendingCompletion] = useState(null)

  // Live subscription — every patch from the API propagates instantly.
  const { items, loading, error: liveError } = useFirestoreCollection(
    'selectProjectSubmissions',
    adaptProjectForAdmin
  )
  const projects = useMemo(
    () => items.filter((row) => !INQUIRY_STATUSES.has(row.status)),
    [items]
  )

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

  const applyStatusChange = async (projectId, newStatus) => {
    const project = projects.find((p) => p.id === projectId)
    const newHistory = [
      ...(project?.history || []),
      createHistoryEntry(`changed status to "${newStatus}" from the list view`),
    ]
    setOpenStatusProjectId(null)
    setErrorMsg('')
    try {
      await updateAdminProjectSubmission(projectId, {
        status: newStatus,
        history: newHistory,
      })
      // No reload — the onSnapshot listener picks up the change live.
    } catch (err) {
      setErrorMsg(err?.message || 'Could not update status.')
    }
  }

  const handleStatusChange = (projectId, newStatus) => {
    const project = projects.find((currentProject) => currentProject.id === projectId)

    if (!project || isProjectCompleted(project.status)) {
      setLockedStatusProject(project || null)
      setOpenStatusProjectId(null)
      return
    }

    if (project.status === newStatus) {
      setOpenStatusProjectId(null)
      return
    }

    if (isProjectCompleted(newStatus)) {
      setPendingCompletion(project)
      setOpenStatusProjectId(null)
      return
    }

    applyStatusChange(projectId, newStatus)
  }

  const confirmCompletion = () => {
    if (pendingCompletion) {
      applyStatusChange(pendingCompletion.id, 'Project Completed')
    }
    setPendingCompletion(null)
  }

  return (
    <AdminShell
      title="Project Management"
      subtitle="Manage active client projects and track their progress."
    >
      <section className="admin-users-card admin-projects-card">
        {(errorMsg || liveError) && (
          <div style={{ padding: '12px 18px', margin: '12px 18px 0', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
            {errorMsg || liveError?.message || 'Could not load projects.'}
          </div>
        )}
        {loading && (
          <div className="admin-loader-container">
            <div className="admin-loader"></div>
            <span>Loading projects...</span>
          </div>
        )}
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
                      {project.submittedByType === 'Associate' ? (
                        <>
                          <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Associate</span>
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
                    {isProjectCompleted(project.status) ? (
                      <span className={`admin-project-status ${project.status.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                        {project.status}
                      </span>
                    ) : (
                    <AdminStatusDropdown
                      badgeClassName="admin-project-status"
                      isOpen={openStatusProjectId === project.id}
                      onClose={() => setOpenStatusProjectId(null)}
                      onOpen={() => setOpenStatusProjectId(project.id)}
                      onStatusChange={(nextStatus) => handleStatusChange(project.id, nextStatus)}
                      status={project.status}
                      statuses={PROJECT_STATUSES}
                    />
                    )}
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

      {pendingCompletion && (
        <div className="admin-modal-backdrop" role="presentation">
          <section
            aria-labelledby="project-complete-confirm-title"
            aria-modal="true"
            className="admin-modal admin-confirm-modal"
            role="dialog"
          >
            <header className="admin-modal-header">
              <div>
                <p>Confirm Action</p>
                <h2 id="project-complete-confirm-title">Do you want to mark this project as complete?</h2>
              </div>
              <button
                aria-label="Close confirmation"
                onClick={() => setPendingCompletion(null)}
                type="button"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </header>
            <div className="admin-modal-body">
              <div className="admin-detail-block">
                <strong>{pendingCompletion.projectTitle}</strong>
                <p>
                  Once marked as completed, the project becomes locked. Its status, details,
                  description, files, notes, and other fields can no longer be edited or updated.
                  This action cannot be reversed.
                </p>
              </div>
              <div className="admin-modal-actions">
                <button
                  className="admin-link-button secondary"
                  onClick={() => setPendingCompletion(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="admin-link-button"
                  onClick={confirmCompletion}
                  type="button"
                >
                  Continue
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

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
                <h2 id="project-locked-title">Status cannot be changed</h2>
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
