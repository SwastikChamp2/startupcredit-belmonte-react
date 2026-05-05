import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import AdminPagination from './AdminPagination'
import useAdminPagination from './useAdminPagination'
import { getAssociateFullName, getBusinessAssociates, updateBusinessAssociate } from './mockBusinessAssociates'
import './admin.css'

const ASSOCIATE_TABS = ['All Inquiries', 'Verified Associates']
const ASSOCIATE_STATUSES = ['Inquiry Submitted', 'Verification In progress', 'Verified']

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
  const [associates, setAssociates] = useState(() => getBusinessAssociates())
  const [sortOrder, setSortOrder] = useState('desc')

  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'Today' || dateStr === '-') return Number.MAX_SAFE_INTEGER
    return new Date(dateStr).getTime()
  }

  const handleStatusChange = (associateId, newStatus) => {
    updateBusinessAssociate(associateId, (assoc) => ({ ...assoc, status: newStatus }))
    setAssociates(getBusinessAssociates())
  }

  const verifiedCount = associates.filter((associate) => associate.status === 'Verified').length

  const filteredAssociates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    const filtered = associates.filter((associate) => {
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

    return filtered.sort((a, b) => {
      const timeA = parseDate(a.appliedOn)
      const timeB = parseDate(b.appliedOn)
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
    })
  }, [activeTab, associates, searchTerm, statusFilter, sortOrder])
  const associatesPagination = useAdminPagination(filteredAssociates)

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
                <th>
                  Applied On{' '}
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
              {associatesPagination.paginatedItems.map((associate) => {
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
                      <select
                        className={`admin-investor-status ${getStatusClass(associate.status)}`}
                        value={associate.status}
                        onChange={(e) => handleStatusChange(associate.id, e.target.value)}
                        style={{ border: 'none', cursor: 'pointer', appearance: 'auto' }}
                      >
                        {ASSOCIATE_STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
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

        <AdminPagination
          {...associatesPagination}
          itemLabel="associates"
          totalRecords={associates.length}
        />
      </section>
    </AdminShell>
  )
}

export default AdminBusinessAssociates
