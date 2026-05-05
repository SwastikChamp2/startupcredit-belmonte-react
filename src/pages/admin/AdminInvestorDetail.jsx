import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminShell from './AdminShell'
import AdminPagination from './AdminPagination'
import useAdminPagination from './useAdminPagination'
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
  const [draftInvestor, setDraftInvestor] = useState(initialInvestor)
  const [editingCard, setEditingCard] = useState(null)
  const [activeTab, setActiveTab] = useState('Investor Details')
  const [notes, setNotes] = useState(initialInvestor?.notes || '')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [documents, setDocuments] = useState(initialInvestor?.documents || [])
  const documentsPagination = useAdminPagination(documents)

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

  const saveEdits = () => {
    // Update the local state and draft state
    setInvestor(draftInvestor)
    
    // Update central mock data
    const centralInvestor = mockInvestors.find((i) => i.id === investorId)
    if (centralInvestor) {
      Object.assign(centralInvestor, draftInvestor)
    }
    
    setEditingCard(null)
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
    <AdminShell title={investor.name} subtitle={investor.investorType}>
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
              <p>{investor.investorType}</p>
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
                <header className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0 }}>Investor Information</h2>
                  {editingCard === 'investorInfo' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="admin-link-button secondary" onClick={() => { setDraftInvestor(investor); setEditingCard(null); }} type="button" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Cancel</button>
                      <button className="admin-link-button" onClick={saveEdits} type="button" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Save</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingCard('investorInfo')} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.25rem' }} title="Edit Investor Information">
                      <i className="fa-solid fa-pencil" aria-hidden="true"></i>
                    </button>
                  )}
                </header>
                <div className="admin-detail-grid project-info-grid">
                  <div>
                    <span>Nature of Investor</span>
                    {editingCard === 'investorInfo' ? (
                      <select value={draftInvestor.investorType} onChange={(e) => setDraftInvestor({ ...draftInvestor, investorType: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                        <option value="Individual">Individual</option>
                        <option value="Organisation">Organisation</option>
                      </select>
                    ) : (
                      <strong>{investor.investorType}</strong>
                    )}
                  </div>
                  <div>
                    <span>Name of Investor</span>
                    {editingCard === 'investorInfo' ? (
                      <input type="text" value={draftInvestor.name} onChange={(e) => setDraftInvestor({ ...draftInvestor, name: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{investor.name}</strong>
                    )}
                  </div>
                  {((editingCard === 'investorInfo' && draftInvestor.investorType === 'Organisation') || (editingCard !== 'investorInfo' && investor.investorType === 'Organisation')) && (
                    <div>
                      <span>Type of Entity</span>
                      {editingCard === 'investorInfo' ? (
                        <input type="text" value={draftInvestor.entityType || ''} onChange={(e) => setDraftInvestor({ ...draftInvestor, entityType: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                      ) : (
                        <strong>{investor.entityType}</strong>
                      )}
                    </div>
                  )}
                  <div>
                    <span>Average Check Size</span>
                    {editingCard === 'investorInfo' ? (
                      <input type="text" value={draftInvestor.checkSize} onChange={(e) => setDraftInvestor({ ...draftInvestor, checkSize: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{investor.checkSize}</strong>
                    )}
                  </div>
                  <div>
                    <span>Email</span>
                    {editingCard === 'investorInfo' ? (
                      <input type="email" value={draftInvestor.email} onChange={(e) => setDraftInvestor({ ...draftInvestor, email: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{investor.email}</strong>
                    )}
                  </div>
                  <div>
                    <span>Phone</span>
                    {editingCard === 'investorInfo' ? (
                      <input type="text" value={draftInvestor.phone} onChange={(e) => setDraftInvestor({ ...draftInvestor, phone: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{investor.phone}</strong>
                    )}
                  </div>
                  <div>
                    <span>PAN Number</span>
                    {editingCard === 'investorInfo' ? (
                      <input type="text" value={draftInvestor.pan || ''} onChange={(e) => setDraftInvestor({ ...draftInvestor, pan: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{investor.pan}</strong>
                    )}
                  </div>
                  {((editingCard === 'investorInfo' && draftInvestor.investorType === 'Individual') || (editingCard !== 'investorInfo' && investor.investorType === 'Individual')) && (
                    <div>
                      <span>Aadhaar Number</span>
                      {editingCard === 'investorInfo' ? (
                        <input type="text" value={draftInvestor.aadhaar || ''} onChange={(e) => setDraftInvestor({ ...draftInvestor, aadhaar: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                      ) : (
                        <strong>{investor.aadhaar}</strong>
                      )}
                    </div>
                  )}
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
                    {documentsPagination.paginatedItems.map((document) => (
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
              <AdminPagination
                {...documentsPagination}
                itemLabel="documents"
                totalRecords={documents.length}
              />
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
