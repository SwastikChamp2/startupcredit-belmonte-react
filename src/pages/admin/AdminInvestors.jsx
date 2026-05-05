import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import AdminPagination from './AdminPagination'
import useAdminPagination from './useAdminPagination'
import { getInvestors, updateInvestor } from './mockInvestors'
import './admin.css'

const INVESTOR_STATUSES = ['Inquiry Submitted', 'Verification In progress', 'Verified', 'Rejected']

const INVESTOR_TABS = ['All Investors', 'Verified Investors', 'Rejected Investors']

function getStatusClass(status) {
  if (status === 'Verified') return 'accepted'
  if (status === 'Verification In progress') return 'pending'
  if (status === 'Rejected') return 'rejected'
  return 'submitted'
}

function getTabCount(tab, investors) {
  if (tab === 'All Investors') {
    return investors.length
  }

  const status = tab === 'Verified Investors' ? 'Verified' : 'Rejected'
  return investors.filter((investor) => investor.status === status).length
}

function AdminInvestors() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const navigate = useNavigate()
  const [investors, setInvestors] = useState(() => getInvestors())
  const [activeTab, setActiveTab] = useState('All Investors')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [sortOrder, setSortOrder] = useState('desc')

  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'Today' || dateStr === '-') return Number.MAX_SAFE_INTEGER
    return new Date(dateStr).getTime()
  }

  const handleStatusChange = (investorId, newStatus) => {
    updateInvestor(investorId, (inv) => ({ ...inv, status: newStatus }))
    setInvestors(getInvestors())
  }

  const filteredInvestors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    const filtered = investors.filter((investor) => {
      const matchesTab =
        activeTab === 'All Investors' ||
        (activeTab === 'Verified Investors' && investor.status === 'Verified') ||
        (activeTab === 'Rejected Investors' && investor.status === 'Rejected')
      const matchesSearch =
        !query ||
        investor.name.toLowerCase().includes(query) ||
        investor.email.toLowerCase().includes(query)
      const matchesStatus =
        statusFilter === 'All Status' || investor.status === statusFilter

      return matchesTab && matchesSearch && matchesStatus
    })

    return filtered.sort((a, b) => {
      const timeA = parseDate(a.appliedOn)
      const timeB = parseDate(b.appliedOn)
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
    })
  }, [activeTab, searchTerm, statusFilter, investors, sortOrder])
  const investorsPagination = useAdminPagination(filteredInvestors)

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <AdminShell
      title="Investor Management"
      subtitle="Manage investor applications and verification status."
    >
      <section className="admin-users-card admin-investors-card">
        <div className="admin-users-toolbar">
          <div className="admin-user-tabs" aria-label="Investor status summary">
            {INVESTOR_TABS.map((tab) => (
              <button
                className={activeTab === tab ? 'active' : ''}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab} ({getTabCount(tab, investors)})
              </button>
            ))}
          </div>
        </div>

        <div className="admin-users-toolbar admin-investors-toolbar">
          <label className="admin-users-search admin-inquiry-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input
              aria-label="Search investors"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or email..."
              type="search"
              value={searchTerm}
            />
          </label>

          <select
            aria-label="Filter investors by status"
            className="admin-filter-select"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option value="All Status">All Status</option>
            <option value="Inquiry Submitted">Inquiry Submitted</option>
            <option value="Verification In progress">Verification In progress</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="admin-users-table-wrap">
          <table className="admin-users-table admin-investors-table">
            <thead>
              <tr>
                <th>Investor Name</th>
                <th>Email</th>
                <th>Phone</th>
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
              {investorsPagination.paginatedItems.map((investor) => (
                <tr key={investor.id}>
                  <td>
                    <div className="admin-user-name">
                      <span>{investor.avatar}</span>
                      <div className="admin-project-cell">
                        <strong>{investor.name}</strong>
                        <span>{investor.investorType}</span>
                      </div>
                    </div>
                  </td>
                  <td>{investor.email}</td>
                  <td>{investor.phone}</td>
                  <td>
                    <select
                      className={`admin-investor-status ${getStatusClass(investor.status)}`}
                      value={investor.status}
                      onChange={(e) => handleStatusChange(investor.id, e.target.value)}
                      style={{ border: 'none', cursor: 'pointer', appearance: 'auto' }}
                    >
                      {INVESTOR_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>{investor.appliedOn}</td>
                  <td>
                    <div className="admin-user-actions">
                      <button
                        onClick={() => navigate(`/admin/investors/${investor.id}`)}
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

          {filteredInvestors.length === 0 && (
            <div className="admin-users-empty">
              <i className="fa-regular fa-user" aria-hidden="true"></i>
              <strong>No investors found</strong>
              <span>Try changing the search or status filter.</span>
            </div>
          )}
        </div>

        <AdminPagination
          {...investorsPagination}
          itemLabel="investors"
          totalRecords={investors.length}
        />
      </section>
    </AdminShell>
  )
}

export default AdminInvestors
