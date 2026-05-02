import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import { getAssociateFullName, getBusinessAssociates } from './mockBusinessAssociates'
import './admin.css'

const ASSOCIATE_PROJECTS = [
  {
    id: 'project-solar-panel',
    associateEmail: 'vikram.kumar@example.com',
    projectTitle: 'Solar Panel Manufacturing Unit',
    nicCode: '29309',
    sector: 'Manufacturing',
    clientName: 'SunPower Solutions Pvt. Ltd.',
    status: 'Project Filing In Progress',
    lastUpdated: '12 May 2024',
    turnover: 4500000,
  },
  {
    id: 'ba-project-organic-fertilizer',
    associateEmail: 'vikram.kumar@example.com',
    projectTitle: 'Organic Fertilizer Unit',
    nicCode: '23999',
    sector: 'Agri & Allied',
    clientName: 'GreenEarth Organics',
    status: 'Awaiting Documents',
    lastUpdated: '11 May 2024',
    turnover: 1850000,
  },
  {
    id: 'ba-project-cold-storage',
    associateEmail: 'vikram.kumar@example.com',
    projectTitle: 'Cold Storage Facility',
    nicCode: '52102',
    sector: 'Logistics',
    clientName: 'FreshMart Retail Pvt. Ltd.',
    status: 'Project Approved',
    lastUpdated: '06 May 2024',
    turnover: 7500000,
  },
  {
    id: 'ba-project-charging',
    associateEmail: 'vikram.kumar@example.com',
    projectTitle: 'EV Charging Station Network',
    nicCode: '35105',
    sector: 'Infrastructure',
    clientName: 'ChargeUp Mobility Pvt. Ltd.',
    status: 'Project Filing Done',
    lastUpdated: '05 May 2024',
    turnover: 12000000,
  },
  {
    id: 'ba-project-agri-export',
    associateEmail: 'vikram.kumar@example.com',
    projectTitle: 'Agri Produce Export Unit',
    nicCode: '46309',
    sector: 'Export',
    clientName: 'Global Agri Exports',
    status: 'In Discussion',
    lastUpdated: '04 May 2024',
    turnover: 3200000,
  },
  {
    id: 'ba-project-textile',
    associateEmail: 'pooja.shah@example.com',
    projectTitle: 'Textile Processing Unit',
    nicCode: '13129',
    sector: 'Manufacturing',
    clientName: 'Shah Textiles LLP',
    status: 'Project Started',
    lastUpdated: '08 May 2024',
    turnover: 6200000,
  },
  {
    id: 'ba-project-packaging',
    associateEmail: 'pooja.shah@example.com',
    projectTitle: 'Eco Packaging Plant',
    nicCode: '17021',
    sector: 'Manufacturing',
    clientName: 'GreenPack Industries',
    status: 'Project Completed',
    lastUpdated: '02 May 2024',
    turnover: 9000000,
  },
  {
    id: 'ba-project-food',
    associateEmail: 'pooja.shah@example.com',
    projectTitle: 'Food Processing Expansion',
    nicCode: '10309',
    sector: 'Food Processing',
    clientName: 'PureFoods India',
    status: 'All Documents Sent',
    lastUpdated: '30 April 2024',
    turnover: 4100000,
  },
]

function getStatusClass(status) {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function formatCurrency(amount) {
  if (!amount || amount === 0) return '₹ 0'
  
  if (amount >= 10000000) {
    return `₹ ${(amount / 10000000).toFixed(2)} Cr`
  }

  if (amount >= 100000) {
    return `₹ ${(amount / 100000).toFixed(2)} L`
  }

  return `₹ ${amount.toLocaleString('en-IN')}`
}

function getAssociateProjects(associateEmail) {
  return ASSOCIATE_PROJECTS.filter((project) => project.associateEmail === associateEmail)
}

function AdminBusinessAssociateManagement() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [sectorFilter, setSectorFilter] = useState('All Sectors')
  const [expandedAssociateId, setExpandedAssociateId] = useState('BA-003')

  const verifiedAssociates = useMemo(
    () => getBusinessAssociates().filter((associate) => associate.status === 'Verified'),
    [],
  )
  const sectors = [...new Set(ASSOCIATE_PROJECTS.map((project) => project.sector))]
  const projectStatuses = [...new Set(ASSOCIATE_PROJECTS.map((project) => project.status))]

  const associateRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return verifiedAssociates
      .map((associate) => {
        const projects = getAssociateProjects(associate.email)
        const filteredProjects = projects.filter((project) => {
          const matchesStatus =
            statusFilter === 'All Status' || project.status === statusFilter
          const matchesSector =
            sectorFilter === 'All Sectors' || project.sector === sectorFilter

          return matchesStatus && matchesSector
        })
        const totalProjects = projects.length
        const completed = projects.filter((project) => project.status === 'Project Completed').length
        const inProgress = Math.max(totalProjects - completed, 0)
        const totalTurnover = projects.reduce((sum, project) => sum + project.turnover, 0)
        const fullName = getAssociateFullName(associate)
        const matchesSearch =
          !query ||
          fullName.toLowerCase().includes(query) ||
          associate.email.toLowerCase().includes(query) ||
          associate.profession.toLowerCase().includes(query)

        return {
          associate,
          fullName,
          projects,
          filteredProjects,
          totalProjects,
          inProgress,
          completed,
          totalTurnover,
          isVisible: matchesSearch && filteredProjects.length > 0,
        }
      })
      .filter((row) => row.isVisible)
  }, [searchTerm, sectorFilter, statusFilter, verifiedAssociates])

  const allProjects = verifiedAssociates.flatMap((associate) => getAssociateProjects(associate.email))
  const projectsCompleted = allProjects.filter((project) => project.status === 'Project Completed').length
  const totalTurnover = allProjects.reduce((sum, project) => sum + project.turnover, 0)

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <AdminShell
      title="Business Associate Management"
      subtitle="Manage verified business associates and track the projects they file through Startup Credit."
    >
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
            <strong>{allProjects.length}</strong>
            <p>All Projects</p>
          </div>
        </article>
        <article className="admin-ba-stat-card warning">
          <i className="fa-solid fa-clock" aria-hidden="true"></i>
          <div>
            <span>Projects In Progress</span>
            <strong>{allProjects.length - projectsCompleted}</strong>
            <p>Active</p>
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
        <article className="admin-ba-stat-card purple">
          <i className="fa-solid fa-indian-rupee-sign" aria-hidden="true"></i>
          <div>
            <span>Total Turnover</span>
            <strong>{formatCurrency(totalTurnover)}</strong>
            <p>All Projects</p>
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
            {projectStatuses.map((status) => (
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
                <th>Total Turnover</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {associateRows.map((row) => {
                const isExpanded = expandedAssociateId === row.associate.id

                return (
                  <tr className="admin-ba-associate-row" key={row.associate.id}>
                    <td colSpan={7}>
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
                        <strong className="admin-ba-turnover-cell">{formatCurrency(row.totalTurnover)}</strong>
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
                          >
                            <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`} aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="admin-ba-project-panel">
                          <h3>Projects ({row.filteredProjects.length})</h3>
                          <div className="admin-ba-project-list">
                            {row.filteredProjects.map((project) => (
                              <article
                                className="admin-ba-project-item"
                                key={`${row.associate.id}-${project.id}`}
                              >
                                <div className="admin-ba-project-main">
                                  <strong>{project.projectTitle}</strong>
                                  <span>{project.clientName}</span>
                                  <div className="admin-ba-project-meta">
                                    <span>NIC {project.nicCode}</span>
                                    <span>{project.sector}</span>
                                  </div>
                                </div>

                                <div className="admin-ba-project-progress">
                                  <span className={`admin-project-status ${getStatusClass(project.status)}`}>
                                    {project.status}
                                  </span>
                                </div>

                                <div className="admin-ba-project-facts">
                                  <span>Last updated</span>
                                  <strong>{project.lastUpdated}</strong>
                                </div>

                                <div className="admin-ba-project-facts">
                                  <span>Turnover</span>
                                  <strong>{formatCurrency(project.turnover)}</strong>
                                </div>

                                <button
                                  aria-label={`View ${project.projectTitle}`}
                                  className="admin-ba-icon-action"
                                  disabled={!project.id.startsWith('project-')}
                                  onClick={() => project.id.startsWith('project-') && navigate(`/admin/projects/${project.id}`, { state: { from: '/admin/business-associate-management' } })}
                                  type="button"
                                >
                                  <i className="fa-regular fa-eye" aria-hidden="true"></i>
                                </button>
                              </article>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {associateRows.length === 0 && (
            <div className="admin-users-empty">
              <i className="fa-regular fa-address-card" aria-hidden="true"></i>
              <strong>No verified associates found</strong>
              <span>Try changing the search or project filters.</span>
            </div>
          )}
        </div>

        <footer className="admin-users-footer">
          Showing {associateRows.length} of {verifiedAssociates.length} verified associates
        </footer>
      </section>
    </AdminShell>
  )
}

export default AdminBusinessAssociateManagement
