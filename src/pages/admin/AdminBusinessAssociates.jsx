import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import { getAssociateFullName, getBusinessAssociates } from './mockBusinessAssociates'
import './admin.css'

const ASSOCIATE_TABS = ['All Inquiries', 'Verified Associates']

function getStatusClass(status) {
  if (status === 'Verified') return 'accepted'
  if (status === 'Verification In progress') return 'pending'
  return 'submitted'
}

function AdminBusinessAssociates() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All Inquiries')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [associates] = useState(() => getBusinessAssociates())

  const verifiedCount = associates.filter((associate) => associate.status === 'Verified').length

  const filteredAssociates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return associates.filter((associate) => {
      const fullName = getAssociateFullName(associate)
      const matchesTab =
        activeTab === 'All Inquiries' ||
        (activeTab === 'Verified Associates' && associate.status === 'Verified')
      const matchesSearch =
        !query ||
        fullName.toLowerCase().includes(query) ||
        associate.email.toLowerCase().includes(query) ||
        associate.mobile.toLowerCase().includes(query) ||
        associate.profession.toLowerCase().includes(query)
      const matchesStatus =
        statusFilter === 'All Status' || associate.status === statusFilter

      return matchesTab && matchesSearch && matchesStatus
    })
  }, [activeTab, associates, searchTerm, statusFilter])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <AdminShell
      title="Business Associate Inquiries"
      subtitle="Manage and verify all business associate applications."
    >
      <section className="admin-users-card admin-associates-card">
        <div className="admin-users-toolbar">
          <div className="admin-user-tabs" aria-label="Business associate status summary">
            {ASSOCIATE_TABS.map((tab) => (
              <button
                className={activeTab === tab ? 'active' : ''}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab} ({tab === 'All Inquiries' ? associates.length : verifiedCount})
              </button>
            ))}
          </div>
        </div>

        <div className="admin-users-toolbar admin-investors-toolbar">
          <label className="admin-users-search admin-inquiry-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input
              aria-label="Search business associates"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, mobile, or profession..."
              type="search"
              value={searchTerm}
            />
          </label>

          <select
            aria-label="Filter business associates by status"
            className="admin-filter-select"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option value="All Status">All Status</option>
            <option value="Inquiry Submitted">Inquiry Submitted</option>
            <option value="Verification In progress">Verification In progress</option>
            <option value="Verified">Verified</option>
          </select>
        </div>

        <div className="admin-users-table-wrap">
          <table className="admin-users-table admin-investors-table">
            <thead>
              <tr>
                <th>Associate / Profession</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Applied On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssociates.map((associate) => {
                const fullName = getAssociateFullName(associate)

                return (
                  <tr key={associate.id}>
                    <td>
                      <div className="admin-user-name">
                        <span>{associate.avatar}</span>
                        <div className="admin-project-cell">
                          <strong>{fullName}</strong>
                          <span>{associate.profession}</span>
                        </div>
                      </div>
                    </td>
                    <td>{associate.email}</td>
                    <td>{associate.mobile}</td>
                    <td>
                      <span className={`admin-investor-status ${getStatusClass(associate.status)}`}>
                        {associate.status}
                      </span>
                    </td>
                    <td>{associate.appliedOn}</td>
                    <td>
                      <div className="admin-user-actions">
                        <button
                          onClick={() => navigate(`/admin/business-associates/${associate.id}`)}
                          type="button"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredAssociates.length === 0 && (
            <div className="admin-users-empty">
              <i className="fa-regular fa-address-card" aria-hidden="true"></i>
              <strong>No business associates found</strong>
              <span>Try changing the search or status filter.</span>
            </div>
          )}
        </div>

        <footer className="admin-users-footer">
          Showing {filteredAssociates.length} of {associates.length} associates
        </footer>
      </section>
    </AdminShell>
  )
}

export default AdminBusinessAssociates
