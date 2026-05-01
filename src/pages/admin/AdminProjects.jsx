import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import { PROJECT_STATUSES, getProjects } from './adminProjectData'

function getStatusClass(status) {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function AdminProjects() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const navigate = useNavigate()
  const [projects] = useState(() => getProjects())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return projects.filter((project) => {
      const matchesStatus = statusFilter === 'All' || project.status === statusFilter
      const matchesSearch =
        !query ||
        project.projectTitle.toLowerCase().includes(query) ||
        project.clientName.toLowerCase().includes(query) ||
        project.clientEmail.toLowerCase().includes(query) ||
        project.nicCode.toLowerCase().includes(query)

      return matchesStatus && matchesSearch
    })
  }, [projects, searchTerm, statusFilter])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
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
                <th>Project / Client</th>
                <th>NIC Code</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id}>
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
                    <span className={`admin-project-status ${getStatusClass(project.status)}`}>
                      {project.status}
                    </span>
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

        <footer className="admin-users-footer">
          Showing {filteredProjects.length} of {projects.length} projects
        </footer>
      </section>
    </AdminShell>
  )
}

export default AdminProjects
