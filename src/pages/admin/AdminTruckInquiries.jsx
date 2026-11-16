import { useMemo, useState } from 'react'
import AdminShell from './AdminShell'
import AdminPagination from './AdminPagination'
import useAdminPagination from './useAdminPagination'
import {
  adaptTruckInquiryForAdmin,
  deleteAdminTruckInquiry,
} from '../../services/adminDataApi'
import { useFirestoreCollection } from '../../hooks/useFirestoreSnapshot'
import './admin.css'

function AdminTruckInquiries() {
  const [errorMsg, setErrorMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [inquiryToDelete, setInquiryToDelete] = useState(null)
  const [actionPending, setActionPending] = useState(null)
  const [sortOrder, setSortOrder] = useState('desc')

  const { items: inquiries, loading, error: liveError } = useFirestoreCollection(
    'truckInquiries',
    adaptTruckInquiryForAdmin
  )

  const filteredInquiries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const filtered = term
      ? inquiries.filter((inquiry) =>
          [inquiry.companyName, inquiry.name, inquiry.email, inquiry.vehicleModel]
            .some((value) => (value || '').toLowerCase().includes(term))
        )
      : [...inquiries]
    return filtered.sort((a, b) => {
      const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() || 0 : 0
      const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() || 0 : 0
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
    })
  }, [inquiries, searchTerm, sortOrder])

  const pagination = useAdminPagination(filteredInquiries)

  const confirmDelete = async () => {
    if (!inquiryToDelete) return
    setActionPending(inquiryToDelete.id)
    setErrorMsg('')
    try {
      await deleteAdminTruckInquiry(inquiryToDelete.id)
      setInquiryToDelete(null)
    } catch (err) {
      setErrorMsg(err?.message || 'Could not delete inquiry.')
    } finally {
      setActionPending(null)
    }
  }

  return (
    <AdminShell title="Truck Inquiry" subtitle="View truck inquiries submitted through the website.">
      <section className="admin-users-card">
        {(errorMsg || liveError) && (
          <div style={{ padding: '12px 18px', margin: '12px 18px 0', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
            {errorMsg || liveError?.message || 'Could not load truck inquiries.'}
          </div>
        )}
        {loading && (
          <div className="admin-loader-container">
            <div className="admin-loader"></div>
            <span>Loading truck inquiries...</span>
          </div>
        )}

        <div className="admin-users-toolbar">
          <label className="admin-users-search admin-contact-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input
              aria-label="Search truck inquiries"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by company, name, email, or model..."
              type="search"
              value={searchTerm}
            />
          </label>
        </div>

        <div className="admin-users-table-wrap">
          <table className="admin-users-table admin-contact-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Name</th>
                <th>Vehicle Model</th>
                <th>Quantity</th>
                <th>
                  Time
                  <button
                    onClick={() => setSortOrder((previous) => previous === 'desc' ? 'asc' : 'desc')}
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
              {pagination.paginatedItems.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>{inquiry.companyName || 'Not provided'}</td>
                  <td>{inquiry.name || 'Not provided'}</td>
                  <td>{inquiry.vehicleModel || 'Not provided'}</td>
                  <td>{inquiry.vehicleQuantity}</td>
                  <td>{inquiry.submittedAt || '—'}</td>
                  <td>
                    <div className="admin-user-actions">
                      <button onClick={() => setSelectedInquiry(inquiry)} type="button">View</button>
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
              <i className="fa-solid fa-truck" aria-hidden="true"></i>
              <strong>No truck inquiries found</strong>
              <span>
                {inquiries.length === 0
                  ? 'No truck inquiries have been received yet.'
                  : 'Try searching with another company, name, email, or model.'}
              </span>
            </div>
          )}
        </div>

        <AdminPagination {...pagination} itemLabel="truck inquiries" totalRecords={inquiries.length} />
      </section>

      {selectedInquiry && (
        <div className="admin-modal-backdrop" role="presentation">
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="truck-inquiry-title">
            <div className="admin-modal-header">
              <div>
                <p>{selectedInquiry.submittedAt || 'Submission time unavailable'}</p>
                <h2 id="truck-inquiry-title">{selectedInquiry.companyName || 'Truck inquiry'}</h2>
              </div>
              <button aria-label="Close truck inquiry" onClick={() => setSelectedInquiry(null)} type="button">
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-detail-grid">
                <div><span>Company Name</span><strong>{selectedInquiry.companyName || 'Not provided'}</strong></div>
                <div><span>Name</span><strong>{selectedInquiry.name || 'Not provided'}</strong></div>
                <div><span>Email</span><strong>{selectedInquiry.email || 'Not provided'}</strong></div>
                <div><span>Phone Number</span><strong>{selectedInquiry.mobile || 'Not provided'}</strong></div>
                <div><span>Vehicle Model</span><strong>{selectedInquiry.vehicleModel || 'Not provided'}</strong></div>
                <div><span>Reefer Container Size</span><strong>{selectedInquiry.reeferContainerSize || 'Not provided'}</strong></div>
                <div><span>Reefer Unit</span><strong>{selectedInquiry.reeferUnit || 'Not provided'}</strong></div>
                <div><span>Temperature (°C)</span><strong>{selectedInquiry.temperature === '' ? 'Not provided' : selectedInquiry.temperature}</strong></div>
                <div><span>Number of Tyres</span><strong>{selectedInquiry.numberOfTyres || 'Not provided'}</strong></div>
                <div><span>Vehicle Quantity</span><strong>{selectedInquiry.vehicleQuantity || 'Not provided'}</strong></div>
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
              Are you sure you want to delete the truck inquiry from <strong>{inquiryToDelete.companyName || inquiryToDelete.name || 'this user'}</strong>? This action cannot be undone.
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

export default AdminTruckInquiries
