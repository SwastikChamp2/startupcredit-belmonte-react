import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import AdminPagination from './AdminPagination'
import useAdminPagination from './useAdminPagination'
import {
  adaptProjectForAdmin,
  updateAdminProjectSubmission,
} from '../../services/adminDataApi'
import { useFirestoreCollection } from '../../hooks/useFirestoreSnapshot'

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NA'
}

function getStatusClass(status) {
  return status === 'Inquiry Accepted' ? 'accepted' : 'pending'
}

// Only "Inquiry Pending" submissions belong on this page. Once an admin accepts
// an inquiry it transitions straight into the active project workflow (status
// "In Discussion") and shows up under Project Management instead.
const INQUIRY_STATUSES = new Set(['Inquiry Pending'])

function AdminProjectInquiries() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const [errorMsg, setErrorMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [actionPending, setActionPending] = useState(null)
  const [sortOrder, setSortOrder] = useState('desc')

  const { items, loading, error: liveError } = useFirestoreCollection(
    'selectProjectSubmissions',
    adaptProjectForAdmin
  )
  const inquiries = useMemo(
    () => items.filter((row) => INQUIRY_STATUSES.has(row.status)),
    [items]
  )

  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === '—') return 0
    return new Date(dateStr).getTime() || 0
  }

  const filteredInquiries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    const result = inquiries.filter((inquiry) => {
      const matchesStatus = statusFilter === 'All' || inquiry.status === statusFilter
      const matchesSource =
        sourceFilter === 'All' ||
        (sourceFilter === 'Self' && inquiry.submittedByType === 'Self') ||
        (sourceFilter === 'Associate' && inquiry.submittedByType === 'Associate')
      const matchesSearch =
        !query ||
        inquiry.projectTitle.toLowerCase().includes(query) ||
        (inquiry.creatorName || '').toLowerCase().includes(query) ||
        (inquiry.creatorEmail || '').toLowerCase().includes(query) ||
        (inquiry.nicCode || '').toLowerCase().includes(query)

      return matchesStatus && matchesSource && matchesSearch
    })

    return result.sort((a, b) => {
      const timeA = parseDate(a.createdAt)
      const timeB = parseDate(b.createdAt)
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
    })
  }, [inquiries, searchTerm, sourceFilter, statusFilter, sortOrder])
  const inquiriesPagination = useAdminPagination(filteredInquiries)

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const acceptInquiry = async (inquiryId) => {
    setActionPending(inquiryId)
    setErrorMsg('')
    try {
      // Transition straight to the first active project workflow status so the
      // submission appears under /admin/projects with a real status.
      await updateAdminProjectSubmission(inquiryId, { status: 'In Discussion' })
      // No reload — the live snapshot will drop this row from the inquiries list.
    } catch (err) {
      setErrorMsg(err?.message || 'Could not accept inquiry.')
    } finally {
      setActionPending(null)
    }
  }

  return (
    <AdminShell
      title="Project Inquiries"
      subtitle="View and manage project inquiries submitted through the website."
    >
      <section className="admin-users-card admin-inquiries-card">
        {(errorMsg || liveError) && (
          <div style={{ padding: '12px 18px', margin: '12px 18px 0', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
            {errorMsg || liveError?.message || 'Could not load inquiries.'}
          </div>
        )}
        {loading && (
          <div className="admin-loader-container">
            <div className="admin-loader"></div>
            <span>Loading project inquiries...</span>
          </div>
        )}

        <div className="admin-users-toolbar admin-inquiries-toolbar">
          <label className="admin-users-search admin-inquiry-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input
              aria-label="Search project inquiries"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by project, name, email, or NIC code..."
              type="search"
              value={searchTerm}
            />
          </label>

          <select
            className="admin-filter-select"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
            aria-label="Filter by inquiry status"
          >
            <option value="All">All Status</option>
            <option value="Inquiry Pending">Inquiry Pending</option>
          </select>

          <select
            className="admin-filter-select"
            onChange={(event) => setSourceFilter(event.target.value)}
            value={sourceFilter}
            aria-label="Filter by inquiry source"
          >
            <option value="All">All Sources</option>
            <option value="Self">Self</option>
            <option value="Associate">Associate</option>
          </select>
        </div>

        <div className="admin-users-table-wrap">
          <table className="admin-users-table admin-inquiries-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>NIC Code</th>
                <th>Created By</th>
                <th>
                  Created On
                  <button
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
                    aria-label="Toggle sort order"
                    type="button"
                  >
                    <i className={`fa-solid fa-arrow-${sortOrder === 'desc' ? 'down' : 'up'}`} aria-hidden="true" style={{ color: 'var(--text-light)' }}></i>
                  </button>
                </th>
                <th>Inquiry Source</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiriesPagination.paginatedItems.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>
                    <div className="admin-project-cell">
                      <strong>{inquiry.projectTitle}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="admin-project-cell">
                      <strong>{inquiry.nicCode || '—'}</strong>
                      <span>{inquiry.nicName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-user-name">
                      <span>{getInitials(inquiry.creatorName)}</span>
                      <div className="admin-project-cell">
                        <strong>{inquiry.creatorName}</strong>
                        <span>{inquiry.creatorEmail}</span>
                      </div>
                    </div>
                  </td>
                  <td>{inquiry.createdAt}</td>
                  <td>
                    <span className={`admin-source ${(inquiry.submittedByType || 'self').toLowerCase()}`}>
                      {inquiry.submittedByType || 'Self'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-inquiry-status ${getStatusClass(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-user-actions">
                      <button onClick={() => setSelectedInquiry(inquiry)} type="button">
                        View
                      </button>
                      <button
                        disabled={inquiry.status === 'Inquiry Accepted' || actionPending === inquiry.id}
                        onClick={() => acceptInquiry(inquiry.id)}
                        type="button"
                      >
                        {actionPending === inquiry.id ? 'Saving…' : 'Accept'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredInquiries.length === 0 && (
            <div className="admin-users-empty">
              <i className="fa-regular fa-folder-open" aria-hidden="true"></i>
              <strong>No project inquiries found</strong>
              <span>
                {inquiries.length === 0
                  ? 'No project inquiries have been submitted yet.'
                  : 'Try changing the search or filters.'}
              </span>
            </div>
          )}
        </div>

        <AdminPagination
          {...inquiriesPagination}
          itemLabel="inquiries"
          totalRecords={inquiries.length}
        />
      </section>

      {selectedInquiry && (
        <div className="admin-modal-backdrop" role="presentation">
          <section
            aria-labelledby="inquiry-details-title"
            className="admin-modal"
            role="dialog"
            aria-modal="true"
          >
            <header className="admin-modal-header">
              <div>
                <p>Project Inquiry</p>
                <h2 id="inquiry-details-title">{selectedInquiry.projectTitle}</h2>
              </div>
              <button
                aria-label="Close inquiry details"
                onClick={() => setSelectedInquiry(null)}
                type="button"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </header>

            <div className="admin-modal-body">
              <div className="admin-detail-block">
                <strong>Project Description</strong>
                <p>{selectedInquiry.projectDescription}</p>
              </div>

              <div className="admin-detail-grid">
                <div>
                  <span>Created By</span>
                  <strong>{selectedInquiry.creatorName}</strong>
                  <p>{selectedInquiry.creatorEmail}</p>
                </div>
                <div>
                  <span>Inquiry Source</span>
                  <strong>{selectedInquiry.submittedByType || 'Self'}</strong>
                </div>
                <div>
                  <span>Created On</span>
                  <strong>{selectedInquiry.createdAt}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{selectedInquiry.status}</strong>
                </div>
              </div>

              <div className="admin-detail-block">
                <strong>NIC Classification</strong>
                <ul className="admin-nic-list">
                  <li>Section {selectedInquiry.sectionCode} - {selectedInquiry.sectionName}</li>
                  <li>Division {selectedInquiry.divisionCode} - {selectedInquiry.divisionName}</li>
                  <li>Group {selectedInquiry.groupCode} - {selectedInquiry.groupName}</li>
                  <li>Class {selectedInquiry.classCode} - {selectedInquiry.className}</li>
                  <li>NIC {selectedInquiry.nicCode} - {selectedInquiry.nicName}</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  )
}

export default AdminProjectInquiries
