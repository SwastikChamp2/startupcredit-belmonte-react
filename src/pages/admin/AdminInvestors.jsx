import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import { mockInvestors } from './mockInvestors'
import './admin.css'

const INVESTOR_TABS = ['All Investors', 'Verified Investors', 'Rejected Investors']

function getStatusClass(status) {
  if (status === 'Verified') return 'accepted'
  if (status === 'Verification In progress') return 'pending'
  if (status === 'Rejected') return 'rejected'
  return 'submitted'
}

function getTabCount(tab) {
  if (tab === 'All Investors') {
    return mockInvestors.length
  }

  const status = tab === 'Verified Investors' ? 'Verified' : 'Rejected'
  return mockInvestors.filter((investor) => investor.status === status).length
}

function AdminInvestors() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All Investors')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')

  const filteredInvestors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return mockInvestors.filter((investor) => {
      const matchesTab =
        activeTab === 'All Investors' ||
        (activeTab === 'Verified Investors' && investor.status === 'Verified') ||
        (activeTab === 'Rejected Investors' && investor.status === 'Rejected')
      const matchesSearch =
        !query ||
        investor.name.toLowerCase().includes(query) ||
        investor.company.toLowerCase().includes(query) ||
        investor.email.toLowerCase().includes(query)
      const matchesStatus =
        statusFilter === 'All Status' || investor.status === statusFilter

      return matchesTab && matchesSearch && matchesStatus
    })
  }, [activeTab, searchTerm, statusFilter])

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
                {tab} ({getTabCount(tab)})
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
              placeholder="Search by name, email, or company..."
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
                <th>Investor / Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Applied On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvestors.map((investor) => (
                <tr key={investor.id}>
                  <td>
                    <div className="admin-user-name">
                      <span>{investor.avatar}</span>
                      <div className="admin-project-cell">
                        <strong>{investor.name}</strong>
                        <span>{investor.company}</span>
                      </div>
                    </div>
                  </td>
                  <td>{investor.email}</td>
                  <td>{investor.phone}</td>
                  <td>
                    <span className={`admin-investor-status ${getStatusClass(investor.status)}`}>
                      {investor.status}
                    </span>
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

        <footer className="admin-users-footer">
          Showing {filteredInvestors.length} of {mockInvestors.length} investors
        </footer>
      </section>
    </AdminShell>
  )
}

export default AdminInvestors
