import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminShell from './AdminShell'
import { mockInvestors } from './mockInvestors'
import './admin.css'

const INVESTOR_TABS = ['Investor Details', 'Documents', 'Activity Log']

function getStatusClass(status) {
  if (status === 'Verified') return 'accepted'
  if (status === 'Verification In progress') return 'pending'
  if (status === 'Rejected') return 'rejected'
  return 'submitted'
}

function AdminInvestorDetail() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const { investorId } = useParams()
  const navigate = useNavigate()
  const initialInvestor = mockInvestors.find((investor) => investor.id === investorId)
  const [investor, setInvestor] = useState(initialInvestor)
  const [activeTab, setActiveTab] = useState('Investor Details')
  const [notes, setNotes] = useState(initialInvestor?.notes || '')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [documents, setDocuments] = useState(initialInvestor?.documents || [])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (!investor) {
    return (
      <AdminShell
        title="Investor Not Found"
        subtitle="The requested investor record could not be found."
      >
        <section className="admin-users-card admin-not-found-card">
          <div className="admin-users-empty">
            <i className="fa-regular fa-user" aria-hidden="true"></i>
            <strong>Investor not found</strong>
            <span>Open Investor Management and choose a valid investor.</span>
            <button className="admin-link-button" onClick={() => navigate('/admin/investors')} type="button">
              Back to Investors
            </button>
          </div>
        </section>
      </AdminShell>
    )
  }

  const updateStatus = (status) => {
    // Update the local state for immediate UI feedback
    setInvestor((currentInvestor) => ({ ...currentInvestor, status }))
    
    // Update the central mock data so changes persist across navigation
    const centralInvestor = mockInvestors.find((i) => i.id === investorId)
    if (centralInvestor) {
      centralInvestor.status = status
      centralInvestor.reviewedOn = new Date().toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      centralInvestor.reviewedBy = 'Admin User'
    }
  }

  const addFile = (event) => {
    const file = event.target.files[0]

    if (!file) {
      return
    }

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: file.name.split('.').pop().toUpperCase(),
      uploadedOn: 'Today',
    }

    setDocuments((currentDocuments) => [...currentDocuments, newDoc])
    
    // Persist to central data
    const centralInvestor = mockInvestors.find((i) => i.id === investorId)
    if (centralInvestor) {
      centralInvestor.documents = [...(centralInvestor.documents || []), newDoc]
    }
  }

  const deleteFile = (documentId) => {
    setDocuments((currentDocuments) =>
      currentDocuments.filter((document) => document.id !== documentId),
    )
    
    // Persist to central data
    const centralInvestor = mockInvestors.find((i) => i.id === investorId)
    if (centralInvestor) {
      centralInvestor.documents = centralInvestor.documents.filter(d => d.id !== documentId)
    }
  }

  return (
    <AdminShell title={investor.name} subtitle={investor.company}>
      <div className="admin-detail-page-actions">
        <button
          className="admin-link-button secondary"
          onClick={() => navigate('/admin/investors')}
          type="button"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          Back to Investors
        </button>
        <span className={`admin-investor-status ${getStatusClass(investor.status)}`}>
          {investor.status}
        </span>
      </div>

      <section className="admin-users-card admin-investor-detail-card">
        <header className="admin-investor-detail-header">
          <div className="admin-investor-identity">
            <span>{investor.avatar}</span>
            <div>
              <h2>{investor.name}</h2>
              <p>{investor.company}</p>
            </div>
          </div>

          {investor.status !== 'Verified' && (
            <div className="admin-investor-status-actions">
              <button
                className="admin-link-button secondary danger-outline"
                onClick={() => updateStatus('Rejected')}
                type="button"
              >
                Reject Investor
              </button>
              <button
                className="admin-link-button"
                onClick={() => updateStatus('Verified')}
                type="button"
              >
                Approve Investor
              </button>
            </div>
          )}
        </header>

        <div className="admin-users-toolbar">
          <div className="admin-user-tabs" aria-label="Investor detail tabs">
            {INVESTOR_TABS.map((tab) => (
              <button
                className={activeTab === tab ? 'active' : ''}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-investor-detail-body">
          {activeTab === 'Investor Details' && (
            <>
              <article className="admin-detail-card admin-bordered-card">
                <header className="admin-section-header">
                  <h2>Basic Information</h2>
                </header>
                <div className="admin-detail-grid project-info-grid">
                  <div>
                    <span>Full Name</span>
                    <strong>{investor.name}</strong>
                  </div>
                  <div>
                    <span>Company Name</span>
                    <strong>{investor.company}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{investor.email}</strong>
                  </div>
                  <div>
                    <span>Designation</span>
                    <strong>{investor.designation}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{investor.phone}</strong>
                  </div>
                  <div>
                    <span>PAN Number</span>
                    <strong>{investor.pan}</strong>
                  </div>
                </div>
              </article>

              <article className="admin-detail-card admin-bordered-card">
                <header className="admin-section-header">
                  <h2>Business Information</h2>
                </header>
                <div className="admin-detail-grid project-info-grid">
                  <div>
                    <span>Company Type</span>
                    <strong>{investor.companyType}</strong>
                  </div>
                  <div>
                    <span>Years in Business</span>
                    <strong>{investor.yearsInBusiness}</strong>
                  </div>
                  <div>
                    <span>Registration Number</span>
                    <strong>{investor.registrationNumber}</strong>
                  </div>
                  <div>
                    <span>Investing Experience</span>
                    <strong>{investor.investingExperience}</strong>
                  </div>
                  <div>
                    <span>Website</span>
                    <strong>{investor.website}</strong>
                  </div>
                  <div>
                    <span>Focus Sectors</span>
                    <strong>{investor.focusSectors}</strong>
                  </div>
                </div>
              </article>

              <article className="admin-detail-card admin-bordered-card">
                <header className="admin-section-header">
                  <h2>Application Information</h2>
                </header>
                <div className="admin-detail-grid project-info-grid">
                  <div>
                    <span>Applied On</span>
                    <strong>{investor.appliedOn}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{investor.status}</strong>
                  </div>
                  <div>
                    <span>Reviewed On</span>
                    <strong>{investor.reviewedOn}</strong>
                  </div>
                  <div>
                    <span>Reviewed By</span>
                    <strong>{investor.reviewedBy}</strong>
                  </div>
                </div>
              </article>
            </>
          )}

          {(activeTab === 'Investor Details' || activeTab === 'Documents') && (
            <article className="admin-detail-card admin-bordered-card">
              <header className="admin-section-header admin-documents-header">
                <h2>Documents</h2>
                <label className="admin-link-button admin-file-label">
                  <i className="fa-solid fa-plus" aria-hidden="true"></i>
                  Add Files
                  <input onChange={addFile} type="file" />
                </label>
              </header>

              <div className="admin-users-table-wrap">
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>Document Name</th>
                      <th>Type</th>
                      <th>Uploaded On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((document) => (
                      <tr key={document.id}>
                        <td>
                          <div className="admin-document-name">
                            <i className="fa-solid fa-file-lines" aria-hidden="true"></i>
                            <strong>{document.name}</strong>
                          </div>
                        </td>
                        <td>{document.type}</td>
                        <td>{document.uploadedOn}</td>
                        <td>
                          <div className="admin-user-actions">
                            <button type="button">Download</button>
                            <button type="button">View</button>
                            <button
                              className="danger"
                              onClick={() => deleteFile(document.id)}
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
              </div>
            </article>
          )}

          {activeTab === 'Investor Details' && (
            <article className="admin-detail-card admin-bordered-card">
              <header className="admin-section-header">
                <h2>Admin Notes</h2>
              </header>
              {isEditingNotes ? (
                <textarea
                  autoFocus
                  className="admin-notes-textarea"
                  onChange={(event) => setNotes(event.target.value)}
                  value={notes}
                ></textarea>
              ) : (
                <div className="admin-notes-display">
                  {notes || 'No notes added yet.'}
                </div>
              )}
              <div className="admin-notes-actions">
                <button
                  className={isEditingNotes ? 'admin-link-button' : 'admin-link-button secondary'}
                  onClick={() => {
                    if (isEditingNotes) {
                      // Persist to central data when saving
                      const centralInvestor = mockInvestors.find((i) => i.id === investorId)
                      if (centralInvestor) {
                        centralInvestor.notes = notes
                      }
                    }
                    setIsEditingNotes((current) => !current)
                  }}
                  type="button"
                >
                  {isEditingNotes ? 'Save Notes' : 'Edit Notes'}
                </button>
              </div>
            </article>
          )}

          {activeTab === 'Activity Log' && (
            <div className="admin-users-empty">
              <i className="fa-regular fa-clock" aria-hidden="true"></i>
              <strong>Activity log coming soon</strong>
              <span>Investor activity events will appear here.</span>
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  )
}

export default AdminInvestorDetail
