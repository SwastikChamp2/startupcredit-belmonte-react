import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import AdminPagination from './AdminPagination'
import useAdminPagination from './useAdminPagination'
import { PROJECT_STATUSES } from './adminProjectData'
import {
  adaptBusinessAssociateForAdmin,
  adaptProjectForAdmin,
  getAssociateFullName,
} from '../../services/adminDataApi'
import { useFirestoreCollection } from '../../hooks/useFirestoreSnapshot'
import './admin.css'

function getStatusClass(status) {
  return String(status || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

const isCompleted = (status) => status === 'Project Completed'
const isInquiryStage = (status) => status === 'Inquiry Pending'

function AdminBusinessAssociateManagement() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [sectorFilter, setSectorFilter] = useState('All Sectors')
  const [expandedAssociateId, setExpandedAssociateId] = useState('')

  const {
    items: allAssociates,
    loading: loadingAssociates,
    error: associatesError,
  } = useFirestoreCollection('businessAssociateApplications', adaptBusinessAssociateForAdmin)
  const {
    items: allProjects,
    loading: loadingProjects,
    error: projectsError,
  } = useFirestoreCollection('selectProjectSubmissions', adaptProjectForAdmin)

  const verifiedAssociates = useMemo(
    () => allAssociates.filter((a) => a.status === 'Verified'),
    [allAssociates]
  )
  const loading = loadingAssociates || loadingProjects
  const errorMsg = associatesError?.message || projectsError?.message || ''

  // Index projects by submitter email (lowercased) for fast lookup.
  const projectsByEmail = useMemo(() => {
    const map = new Map()
    for (const project of allProjects) {
      const email = (project.creatorEmail || '').toLowerCase()
      if (!email) continue
      if (!map.has(email)) map.set(email, [])
      map.get(email).push(project)
    }
    return map
  }, [allProjects])

  // Build the list of all projects associated with verified BAs (so the
  // header stats and the Sector filter only reflect BA-filed projects).
  const associatedProjects = useMemo(() => {
    const result = []
    for (const associate of verifiedAssociates) {
      const email = (associate.email || '').toLowerCase()
      const matches = projectsByEmail.get(email) || []
      for (const project of matches) {
        result.push({ associate, project })
      }
    }
    return result
  }, [verifiedAssociates, projectsByEmail])

  const sectors = useMemo(() => {
    const set = new Set()
    for (const { project } of associatedProjects) {
      if (project.sectionName) set.add(project.sectionName)
    }
    return [...set].sort()
  }, [associatedProjects])

  const associateRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return verifiedAssociates
      .map((associate) => {
        const fullName = getAssociateFullName(associate)
        const email = (associate.email || '').toLowerCase()
        const projects = projectsByEmail.get(email) || []
        const filteredProjects = projects.filter((project) => {
          const matchesStatus =
            statusFilter === 'All Status' || project.status === statusFilter
          const matchesSector =
            sectorFilter === 'All Sectors' || project.sectionName === sectorFilter
          return matchesStatus && matchesSector
        })

        const completed = projects.filter((p) => isCompleted(p.status)).length
        const inProgress = projects.filter(
          (p) => !isCompleted(p.status) && !isInquiryStage(p.status)
        ).length

        const matchesSearch =
          !query ||
          fullName.toLowerCase().includes(query) ||
          (associate.email || '').toLowerCase().includes(query) ||
          (associate.profession || '').toLowerCase().includes(query)

        // When the user has filters applied, only show associates whose
        // projects survive the filter. Otherwise show all verified associates
        // (they may simply have zero matching projects yet).
        const filtersActive =
          statusFilter !== 'All Status' || sectorFilter !== 'All Sectors'
        const isVisible =
          matchesSearch && (!filtersActive || filteredProjects.length > 0)

        return {
          associate,
          fullName,
          projects,
          filteredProjects,
          totalProjects: projects.length,
          inProgress,
          completed,
          isVisible,
        }
      })
      .filter((row) => row.isVisible)
  }, [searchTerm, sectorFilter, statusFilter, verifiedAssociates, projectsByEmail])
  const associatesPagination = useAdminPagination(associateRows)

  const totalProjects = associatedProjects.length
  const projectsCompleted = associatedProjects.filter(
    ({ project }) => isCompleted(project.status)
  ).length
  const projectsInProgress = associatedProjects.filter(
    ({ project }) => !isCompleted(project.status) && !isInquiryStage(project.status)
  ).length

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <AdminShell
      title="Business Associate Management"
      subtitle="Verified business associates and the projects they file through Startup Credit."
    >
      {errorMsg && (
        <div style={{ padding: '12px 18px', margin: '12px 0', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
          {errorMsg}
        </div>
      )}
      {loading && (
        <div className="admin-loader-container">
          <div className="admin-loader"></div>
          <span>Loading associates...</span>
        </div>
      )}

      <section className="admin-ba-stats">
        <article className="admin-ba-stat-card">
          <i className="fa-solid fa-users" aria-hidden="true"></i>
          <div>
            <span>Total Associates</span>
            <strong>{verifiedAssociates.length}</strong>
            <p>Verified</p>
          </div>
        </article>
        <article className="admin-ba-stat-card">
          <i className="fa-solid fa-folder-open" aria-hidden="true"></i>
          <div>
            <span>Total Projects</span>
            <strong>{totalProjects}</strong>
            <p>Filed by associates</p>
          </div>
        </article>
        <article className="admin-ba-stat-card warning">
          <i className="fa-solid fa-clock" aria-hidden="true"></i>
          <div>
            <span>Projects In Progress</span>
            <strong>{projectsInProgress}</strong>
            <p>Active workflow</p>
          </div>
        </article>
        <article className="admin-ba-stat-card success">
          <i className="fa-solid fa-clipboard-check" aria-hidden="true"></i>
          <div>
            <span>Projects Completed</span>
            <strong>{projectsCompleted}</strong>
            <p>Completed</p>
          </div>
        </article>
      </section>

      <section className="admin-users-card admin-ba-management-card">
        <div className="admin-users-toolbar admin-ba-management-toolbar">
          <label className="admin-users-search admin-inquiry-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input
              aria-label="Search verified business associates"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by associate name, email or profession..."
              type="search"
              value={searchTerm}
            />
          </label>

          <select
            aria-label="Filter associate projects by status"
            className="admin-filter-select"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option value="All Status">All Project Status</option>
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            aria-label="Filter associate projects by sector"
            className="admin-filter-select"
            onChange={(event) => setSectorFilter(event.target.value)}
            value={sectorFilter}
          >
            <option value="All Sectors">All Sectors</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>

        <div className="admin-users-table-wrap">
          <table className="admin-users-table admin-ba-management-table">
            <thead>
              <tr>
                <th>Associate / Profession</th>
                <th>Contact</th>
                <th>Total Projects</th>
                <th>In Progress</th>
                <th>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {associatesPagination.paginatedItems.map((row) => {
                const isExpanded = expandedAssociateId === row.associate.id

                return (
                  <tr className="admin-ba-associate-row" key={row.associate.id}>
                    <td colSpan={6}>
                      <div className="admin-ba-row-summary">
                        <div className="admin-user-name">
                          <span>{row.associate.avatar}</span>
                          <div className="admin-project-cell">
                            <strong>{row.fullName}</strong>
                            <span>{row.associate.profession}</span>
                          </div>
                        </div>
                        <div>
                          <strong>{row.associate.email}</strong>
                          <span>{row.associate.mobile}</span>
                        </div>
                        <strong className="admin-ba-metric-cell">{row.totalProjects}</strong>
                        <strong className="admin-ba-metric-cell">{row.inProgress}</strong>
                        <strong className="admin-ba-metric-cell">{row.completed}</strong>
                        <div className="admin-user-actions admin-ba-actions-cell">
                          <button
                            onClick={() => navigate(`/admin/business-associates/${row.associate.id}`, { state: { from: '/admin/business-associate-management' } })}
                            type="button"
                          >
                            View Details
                          </button>
                          <button
                            aria-label={isExpanded ? 'Collapse projects' : 'Expand projects'}
                            onClick={() => setExpandedAssociateId(isExpanded ? '' : row.associate.id)}
                            type="button"
                            disabled={row.totalProjects === 0}
                          >
                            <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`} aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="admin-ba-project-panel">
                          <h3>
                            Projects ({row.filteredProjects.length}
                            {row.filteredProjects.length !== row.totalProjects
                              ? ` of ${row.totalProjects}`
                              : ''})
                          </h3>
                          {row.filteredProjects.length === 0 ? (
                            <p style={{ color: '#64748b', fontSize: 13 }}>
                              {row.totalProjects === 0
                                ? 'This associate has not filed any projects yet.'
                                : 'No projects match the current filters.'}
                            </p>
                          ) : (
                            <div className="admin-ba-project-list">
                              {row.filteredProjects.map((project) => (
                                <article
                                  className="admin-ba-project-item"
                                  key={`${row.associate.id}-${project.id}`}
                                >
                                  <div className="admin-ba-project-main">
                                    <strong>{project.projectTitle}</strong>
                                    <span>{project.clientName || project.creatorName || '—'}</span>
                                    <div className="admin-ba-project-meta">
                                      {project.nicCode && <span>NIC {project.nicCode}</span>}
                                      {project.sectionName && <span>{project.sectionName}</span>}
                                    </div>
                                  </div>

                                  <div className="admin-ba-project-progress">
                                    <span className={`admin-project-status ${getStatusClass(project.status)}`}>
                                      {project.status}
                                    </span>
                                  </div>

                                  <div className="admin-ba-project-facts">
                                    <span>Last updated</span>
                                    <strong>{project.lastUpdated || project.createdAt || '—'}</strong>
                                  </div>

                                  <button
                                    aria-label={`View ${project.projectTitle}`}
                                    className="admin-ba-icon-action"
                                    onClick={() => navigate(`/admin/projects/${project.id}`, { state: { from: '/admin/business-associate-management' } })}
                                    type="button"
                                  >
                                    <i className="fa-regular fa-eye" aria-hidden="true"></i>
                                  </button>
                                </article>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {!loading && associateRows.length === 0 && (
            <div className="admin-users-empty">
              <i className="fa-regular fa-address-card" aria-hidden="true"></i>
              <strong>
                {verifiedAssociates.length === 0
                  ? 'No verified associates yet'
                  : 'No associates match the current filters'}
              </strong>
              <span>
                {verifiedAssociates.length === 0
                  ? 'Verify an associate from Business Associate Inquiries to see them here.'
                  : 'Try clearing the search or status / sector filters.'}
              </span>
            </div>
          )}
        </div>

        <AdminPagination
          {...associatesPagination}
          itemLabel="verified associates"
          totalRecords={verifiedAssociates.length}
        />
      </section>
    </AdminShell>
  )
}

export default AdminBusinessAssociateManagement
