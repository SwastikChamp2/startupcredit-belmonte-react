import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import AdminPagination from './AdminPagination'
import useAdminPagination from './useAdminPagination'
import {
  adaptContactInquiryForAdmin,
  deleteAdminContactInquiry,
} from '../../services/adminDataApi'
import { useFirestoreCollection } from '../../hooks/useFirestoreSnapshot'
import './admin.css'

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NA'
}

function AdminContactManagement() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const [errorMsg, setErrorMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [inquiryToDelete, setInquiryToDelete] = useState(null)
  const [actionPending, setActionPending] = useState(null)
  const [sortOrder, setSortOrder] = useState('desc')

  const { items: inquiries, loading, error: liveError } = useFirestoreCollection(
    'contactInquiries',
    adaptContactInquiryForAdmin
  )

  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === '—') return 0
    return new Date(dateStr).getTime() || 0
  }

  const filteredInquiries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    let result = query 
      ? inquiries.filter(
          (inquiry) =>
            (inquiry.name || '').toLowerCase().includes(query) ||
            (inquiry.email || '').toLowerCase().includes(query) ||
            (inquiry.subject || '').toLowerCase().includes(query),
        )
      : inquiries

    return result.sort((a, b) => {
      const timeA = parseDate(a.submittedAt)
      const timeB = parseDate(b.submittedAt)
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
    })
  }, [inquiries, searchTerm, sortOrder])
  const inquiriesPagination = useAdminPagination(filteredInquiries)

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const confirmDelete = async () => {
    if (!inquiryToDelete) return
    setActionPending(inquiryToDelete.id)
    setErrorMsg('')
    try {
      await deleteAdminContactInquiry(inquiryToDelete.id)
      setInquiryToDelete(null)
      // Live snapshot will drop the row automatically.
    } catch (err) {
      setErrorMsg(err?.message || 'Could not delete inquiry.')
    } finally {
      setActionPending(null)
    }
  }

  return (
    <AdminShell
      title="Contact Us Management"
      subtitle="View inquiries submitted through the website contact form."
    >
      <section className="admin-users-card">
        {(errorMsg || liveError) && (
          <div style={{ padding: '12px 18px', margin: '12px 18px 0', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
            {errorMsg || liveError?.message || 'Could not load contact inquiries.'}
          </div>
        )}
        {loading && (
          <div className="admin-loader-container">
            <div className="admin-loader"></div>
            <span>Loading contact inquiries...</span>
          </div>
        )}

        <div className="admin-users-toolbar">
          <label className="admin-users-search admin-contact-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input
              aria-label="Search contact inquiries"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, or subject..."
              type="search"
              value={searchTerm}
            />
          </label>
        </div>

        <div className="admin-users-table-wrap">
          <table className="admin-users-table admin-contact-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>
                  Time
                  <button
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
                    aria-label="Toggle sort order"
                    type="button"
                  >
                    <i className={`fa-solid fa-arrow-${sortOrder === 'desc' ? 'down' : 'up'}`} aria-hidden="true" style={{ color: 'var(--text-light)' }}></i>
                  </button>
                </th>
                <th>Subject</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiriesPagination.paginatedItems.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>
                    <div className="admin-user-name">
                      <span>{getInitials(inquiry.name || 'NA')}</span>
                      <strong>{inquiry.name || 'Not provided'}</strong>
                    </div>
                  </td>
                  <td>{inquiry.email || 'Not provided'}</td>
                  <td>{inquiry.submittedAt}</td>
                  <td>
                    <strong className="admin-contact-subject">{inquiry.subject || 'No subject'}</strong>
                  </td>
                  <td>
                    <div className="admin-user-actions">
                      <button onClick={() => setSelectedInquiry(inquiry)} type="button">
                        View
                      </button>
                      <button
                        className="danger"
                        disabled={actionPending === inquiry.id}
                        onClick={() => setInquiryToDelete(inquiry)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredInquiries.length === 0 && (
            <div className="admin-users-empty">
              <i className="fa-regular fa-envelope" aria-hidden="true"></i>
              <strong>No contact inquiries found</strong>
              <span>
                {inquiries.length === 0
                  ? 'No messages have been received yet.'
                  : 'Try searching with another name, email, or subject.'}
              </span>
            </div>
          )}
        </div>

        <AdminPagination
          {...inquiriesPagination}
          itemLabel="contact inquiries"
          totalRecords={inquiries.length}
        />
      </section>

      {selectedInquiry && (
        <div className="admin-modal-backdrop" role="presentation">
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="contact-message-title">
            <div className="admin-modal-header">
              <div>
                <p>{selectedInquiry.submittedAt}</p>
                <h2 id="contact-message-title">{selectedInquiry.subject || 'Contact message'}</h2>
              </div>
              <button
                aria-label="Close contact message"
                onClick={() => setSelectedInquiry(null)}
                type="button"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-detail-grid">
                <div>
                  <span>Name</span>
                  <strong>{selectedInquiry.name || 'Not provided'}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{selectedInquiry.email || 'Not provided'}</strong>
                </div>
                <div>
                  <span>Mobile Number</span>
                  <strong>{selectedInquiry.mobile || 'Not provided'}</strong>
                </div>
              </div>
              <div className="admin-detail-block">
                <strong>Message</strong>
                <p>{selectedInquiry.message || 'No message provided.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {inquiryToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 420, width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 18, color: '#0f172a' }}>Delete inquiry</h3>
            <p style={{ margin: '0 0 24px 0', color: '#475569', fontSize: 14, lineHeight: 1.5 }}>
              Are you sure you want to delete this contact inquiry from <strong>{inquiryToDelete.name || inquiryToDelete.email || 'this user'}</strong>?
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setInquiryToDelete(null)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#475569', fontWeight: 500 }}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={actionPending === inquiryToDelete.id}
                style={{ padding: '8px 16px', background: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#fff', fontWeight: 500 }}
                type="button"
              >
                {actionPending === inquiryToDelete.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

export default AdminContactManagement
