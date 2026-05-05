import { useState } from 'react'
import { Navigate, useNavigate, useParams, useLocation } from 'react-router-dom'
import AdminShell from './AdminShell'
import {
  getAssociateFullName,
  getBusinessAssociateById,
  updateBusinessAssociate,
} from './mockBusinessAssociates'
import './admin.css'

const DETAIL_TABS = ['Overview', 'Documents', 'Activity Log']
const FILE_ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png'

function getStatusClass(status) {
  if (status === 'Verified') return 'accepted'
  if (status === 'Verification In progress') return 'pending'
  return 'submitted'
}

function getFileType(fileName) {
  return fileName.split('.').pop()?.toUpperCase() || 'FILE'
}

function AdminBusinessAssociateDetail() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const { associateId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const backPath = location.state?.from || '/admin/business-associates'
  
  const [associate, setAssociate] = useState(() => getBusinessAssociateById(associateId))
  const [draftAssociate, setDraftAssociate] = useState(() => getBusinessAssociateById(associateId))
  const [editingCard, setEditingCard] = useState(null)
  const [activeTab, setActiveTab] = useState('Overview')
  const [notes, setNotes] = useState(associate?.notes || '')
  const [isEditingNotes, setIsEditingNotes] = useState(false)


  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (!associate) {
    return (
      <AdminShell
        title="Business Associate Not Found"
        subtitle="The requested business associate application could not be found."
      >
        <section className="admin-users-card admin-not-found-card">
          <div className="admin-users-empty">
            <i className="fa-regular fa-address-card" aria-hidden="true"></i>
            <strong>Business associate not found</strong>
            <span>Open Business Associate Inquiries and choose a valid application.</span>
            <button className="admin-link-button" onClick={() => navigate('/admin/business-associates')} type="button">
              Back to Associates
            </button>
          </div>
        </section>
      </AdminShell>
    )
  }

  const fullName = getAssociateFullName(associate)

  const syncAssociate = (updater) => {
    const updatedAssociate = updateBusinessAssociate(associate.id, updater)
    setAssociate(updatedAssociate)
    setDraftAssociate(updatedAssociate)
    return updatedAssociate
  }

  const saveEdits = (cardName) => {
    syncAssociate((currentAssociate) => {
      let changes = {}
      if (cardName === 'basicInfo') {
        changes = {
          firstName: draftAssociate.firstName,
          middleName: draftAssociate.middleName,
          lastName: draftAssociate.lastName,
          email: draftAssociate.email,
          mobile: draftAssociate.mobile,
          profession: draftAssociate.profession,
          dob: draftAssociate.dob,
          educationalStatus: draftAssociate.educationalStatus,
        }
      } else if (cardName === 'kycInfo') {
        changes = {
          aadhaarNumber: draftAssociate.aadhaarNumber,
          panNumber: draftAssociate.panNumber,
        }
      } else if (cardName === 'bankInfo') {
        changes = {
          bankAccount: draftAssociate.bankAccount,
          ifscCode: draftAssociate.ifscCode,
          upiId: draftAssociate.upiId,
        }
      }
      return { ...currentAssociate, ...changes }
    })
    setEditingCard(null)
  }

  const updateStatus = (status) => {
    syncAssociate((currentAssociate) => ({ ...currentAssociate, status }))
  }

  const attachDocument = (documentId, file) => {
    if (!file) {
      return
    }

    syncAssociate((currentAssociate) => ({
      ...currentAssociate,
      documents: currentAssociate.documents.map((document) =>
        document.id === documentId
          ? {
              ...document,
              file: {
                name: file.name,
                type: getFileType(file.name),
                uploadedOn: 'Today',
              },
            }
          : document,
      ),
    }))
  }

  const removeDocument = (documentId) => {
    syncAssociate((currentAssociate) => ({
      ...currentAssociate,
      documents: currentAssociate.documents.map((document) =>
        document.id === documentId ? { ...document, file: null } : document,
      ),
    }))
  }

  const saveNotes = () => {
    syncAssociate((currentAssociate) => ({ ...currentAssociate, notes }))
    setIsEditingNotes(false)
  }

  return (
    <AdminShell title={fullName} subtitle={associate.profession}>
      <div className="admin-detail-page-actions">
        <button
          className="admin-link-button secondary"
          onClick={() => navigate(backPath)}
          type="button"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          Back
        </button>
        <span className={`admin-investor-status ${getStatusClass(associate.status)}`}>
          {associate.status}
        </span>
      </div>

      <section className="admin-users-card admin-investor-detail-card">
        <header className="admin-investor-detail-header">
          <div className="admin-investor-identity">
            <span>{associate.avatar}</span>
            <div>
              <h2>{fullName}</h2>
              <p>{associate.profession}</p>
            </div>
          </div>

          {associate.status !== 'Verified' && (
            <div className="admin-investor-status-actions">
              <button
                className="admin-link-button secondary"
                onClick={() => updateStatus('Verification In progress')}
                type="button"
              >
                Mark In Progress
              </button>
              <button
                className="admin-link-button"
                onClick={() => updateStatus('Verified')}
                type="button"
              >
                Verify Associate
              </button>
            </div>
          )}
        </header>

        <div className="admin-users-toolbar">
          <div className="admin-user-tabs" aria-label="Business associate detail tabs">
            {DETAIL_TABS.map((tab) => (
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
          {activeTab === 'Overview' && (
            <>
              <article className="admin-detail-card admin-bordered-card">
                <header className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0 }}>Basic Information</h2>
                  {editingCard === 'basicInfo' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="admin-link-button secondary" onClick={() => { setDraftAssociate(associate); setEditingCard(null); }} type="button" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Cancel</button>
                      <button className="admin-link-button" onClick={() => saveEdits('basicInfo')} type="button" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Save</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingCard('basicInfo')} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.25rem' }} title="Edit Basic Information">
                      <i className="fa-solid fa-pencil" aria-hidden="true"></i>
                    </button>
                  )}
                </header>
                <div className="admin-detail-grid project-info-grid">
                  <div>
                    <span>First Name</span>
                    {editingCard === 'basicInfo' ? (
                      <input type="text" value={draftAssociate.firstName} onChange={(e) => setDraftAssociate({ ...draftAssociate, firstName: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{associate.firstName}</strong>
                    )}
                  </div>
                  <div>
                    <span>Middle Name</span>
                    {editingCard === 'basicInfo' ? (
                      <input type="text" value={draftAssociate.middleName || ''} onChange={(e) => setDraftAssociate({ ...draftAssociate, middleName: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{associate.middleName || '-'}</strong>
                    )}
                  </div>
                  <div>
                    <span>Last Name</span>
                    {editingCard === 'basicInfo' ? (
                      <input type="text" value={draftAssociate.lastName} onChange={(e) => setDraftAssociate({ ...draftAssociate, lastName: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{associate.lastName}</strong>
                    )}
                  </div>
                  <div>
                    <span>Email Address</span>
                    {editingCard === 'basicInfo' ? (
                      <input type="email" value={draftAssociate.email} onChange={(e) => setDraftAssociate({ ...draftAssociate, email: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{associate.email}</strong>
                    )}
                  </div>
                  <div>
                    <span>Mobile Number</span>
                    {editingCard === 'basicInfo' ? (
                      <input type="text" value={draftAssociate.mobile} onChange={(e) => setDraftAssociate({ ...draftAssociate, mobile: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{associate.mobile}</strong>
                    )}
                  </div>
                  <div>
                    <span>Current Profession</span>
                    {editingCard === 'basicInfo' ? (
                      <input type="text" value={draftAssociate.profession} onChange={(e) => setDraftAssociate({ ...draftAssociate, profession: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{associate.profession}</strong>
                    )}
                  </div>
                  <div>
                    <span>Date of Birth</span>
                    {editingCard === 'basicInfo' ? (
                      <input type="date" value={draftAssociate.dob} onChange={(e) => setDraftAssociate({ ...draftAssociate, dob: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{associate.dob}</strong>
                    )}
                  </div>
                  <div>
                    <span>Educational Status</span>
                    {editingCard === 'basicInfo' ? (
                      <input type="text" value={draftAssociate.educationalStatus} onChange={(e) => setDraftAssociate({ ...draftAssociate, educationalStatus: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{associate.educationalStatus}</strong>
                    )}
                  </div>
                </div>
              </article>

              <article className="admin-detail-card admin-bordered-card">
                <header className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0 }}>KYC Information</h2>
                  {editingCard === 'kycInfo' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="admin-link-button secondary" onClick={() => { setDraftAssociate(associate); setEditingCard(null); }} type="button" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Cancel</button>
                      <button className="admin-link-button" onClick={() => saveEdits('kycInfo')} type="button" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Save</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingCard('kycInfo')} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.25rem' }} title="Edit KYC Information">
                      <i className="fa-solid fa-pencil" aria-hidden="true"></i>
                    </button>
                  )}
                </header>
                <div className="admin-detail-grid project-info-grid">
                  <div>
                    <span>Aadhaar Number</span>
                    {editingCard === 'kycInfo' ? (
                      <input type="text" value={draftAssociate.aadhaarNumber} onChange={(e) => setDraftAssociate({ ...draftAssociate, aadhaarNumber: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{associate.aadhaarNumber}</strong>
                    )}
                  </div>
                  <div>
                    <span>PAN Card Number</span>
                    {editingCard === 'kycInfo' ? (
                      <input type="text" value={draftAssociate.panNumber} onChange={(e) => setDraftAssociate({ ...draftAssociate, panNumber: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{associate.panNumber}</strong>
                    )}
                  </div>
                </div>
              </article>

              <article className="admin-detail-card admin-bordered-card">
                <header className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0 }}>Bank Details</h2>
                  {editingCard === 'bankInfo' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="admin-link-button secondary" onClick={() => { setDraftAssociate(associate); setEditingCard(null); }} type="button" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Cancel</button>
                      <button className="admin-link-button" onClick={() => saveEdits('bankInfo')} type="button" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Save</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingCard('bankInfo')} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.25rem' }} title="Edit Bank Details">
                      <i className="fa-solid fa-pencil" aria-hidden="true"></i>
                    </button>
                  )}
                </header>
                <div className="admin-detail-grid project-info-grid">
                  <div>
                    <span>Bank Account Number</span>
                    {editingCard === 'bankInfo' ? (
                      <input type="text" value={draftAssociate.bankAccount} onChange={(e) => setDraftAssociate({ ...draftAssociate, bankAccount: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{associate.bankAccount}</strong>
                    )}
                  </div>
                  <div>
                    <span>IFSC Code</span>
                    {editingCard === 'bankInfo' ? (
                      <input type="text" value={draftAssociate.ifscCode} onChange={(e) => setDraftAssociate({ ...draftAssociate, ifscCode: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{associate.ifscCode}</strong>
                    )}
                  </div>
                  <div>
                    <span>UPI ID</span>
                    {editingCard === 'bankInfo' ? (
                      <input type="text" value={draftAssociate.upiId || ''} onChange={(e) => setDraftAssociate({ ...draftAssociate, upiId: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                    ) : (
                      <strong>{associate.upiId}</strong>
                    )}
                  </div>
                  <div>
                    <span>Applied On</span>
                    <strong>{associate.appliedOn}</strong>
                  </div>
                </div>
              </article>
            </>
          )}

          {(activeTab === 'Overview' || activeTab === 'Documents') && (
            <article className="admin-detail-card admin-bordered-card">
              <header className="admin-section-header">
                <h2>KYC Documents</h2>
              </header>

              <div className="admin-documents-list">
                {associate.documents.map((document) => (
                  <div className="admin-document-row" key={document.id}>
                    <div>
                      <strong>{document.fieldName}</strong>
                      {document.file ? (
                        <span>{document.file.name} · {document.file.type} · {document.file.uploadedOn}</span>
                      ) : (
                        <span>Not uploaded yet</span>
                      )}
                    </div>
                    <div className="admin-document-actions">
                      <label>
                        <i className="fa-solid fa-upload" aria-hidden="true"></i>
                        {document.file ? 'Replace' : 'Upload'}
                        <input
                          accept={FILE_ACCEPT}
                          onChange={(event) => attachDocument(document.id, event.target.files[0])}
                          type="file"
                        />
                      </label>
                      <button
                        disabled={!document.file}
                        onClick={() => removeDocument(document.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}

          {activeTab === 'Overview' && (
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
                  onClick={isEditingNotes ? saveNotes : () => setIsEditingNotes(true)}
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
              <span>Business associate activity events will appear here.</span>
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  )
}

export default AdminBusinessAssociateDetail
