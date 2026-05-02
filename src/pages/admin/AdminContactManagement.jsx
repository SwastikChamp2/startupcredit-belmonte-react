import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import './admin.css'

const CONTACT_INQUIRIES_STORAGE_KEY = 'startupCreditContactInquiries'

const SEEDED_CONTACT_INQUIRIES = [
  {
    id: 'contact-amit-sharma',
    name: 'Amit Sharma',
    email: 'amit.sharma@example.com',
    submittedAt: '12 May 2024, 10:30 AM',
    subject: 'Project funding guidance',
    message: 'I want to understand which government schemes are suitable for my new manufacturing project.',
  },
  {
    id: 'contact-neha-desai',
    name: 'Neha Desai',
    email: 'neha.desai@example.com',
    submittedAt: '11 May 2024, 04:15 PM',
    subject: 'Document support',
    message: 'Please share the document checklist required before submitting a project inquiry on Startup Credit.',
  },
  {
    id: 'contact-rajesh-kulkarni',
    name: 'Rajesh Kulkarni',
    email: 'rajesh.kulkarni@example.com',
    submittedAt: '10 May 2024, 11:20 AM',
    subject: 'Business associate query',
    message: 'I am interested in becoming a business associate and would like to know the verification process.',
  },
  {
    id: 'contact-priya-menon',
    name: 'Priya Menon',
    email: 'priya.menon@example.com',
    submittedAt: '09 May 2024, 09:45 AM',
    subject: 'Investor information',
    message: 'I would like to know how investors can review active startup financing opportunities on your platform.',
  },
]

function readStoredContactInquiries() {
  try {
    return JSON.parse(localStorage.getItem(CONTACT_INQUIRIES_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function AdminContactManagement() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const inquiries = useMemo(
    () => [...readStoredContactInquiries(), ...SEEDED_CONTACT_INQUIRIES],
    [],
  )

  const filteredInquiries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
      return inquiries
    }

    return inquiries.filter(
      (inquiry) =>
        inquiry.name.toLowerCase().includes(query) ||
        inquiry.email.toLowerCase().includes(query) ||
        inquiry.subject.toLowerCase().includes(query),
    )
  }, [inquiries, searchTerm])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <AdminShell
      title="Contact Us Management"
      subtitle="View inquiries submitted through the website contact form."
    >
      <section className="admin-users-card">
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
                <th>Time</th>
                <th>Subject</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inquiry) => (
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInquiries.length === 0 && (
            <div className="admin-users-empty">
              <i className="fa-regular fa-envelope" aria-hidden="true"></i>
              <strong>No contact inquiries found</strong>
              <span>Try searching with another name, email, or subject.</span>
            </div>
          )}
        </div>

        <footer className="admin-users-footer">
          Showing {filteredInquiries.length} of {inquiries.length} contact inquiries
        </footer>
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
              </div>
              <div className="admin-detail-block">
                <strong>Message</strong>
                <p>{selectedInquiry.message || 'No message provided.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

export default AdminContactManagement
