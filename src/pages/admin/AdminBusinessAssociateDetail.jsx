import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams, useLocation } from 'react-router-dom'
import AdminShell from './AdminShell'
import DocumentPreviewModal from '../../components/DocumentPreviewModal'
import {
  fetchAdminBusinessAssociate,
  updateAdminBusinessAssociate,
  getAssociateFullName,
  setAdminUserRole,
  findUserByEmail,
  uploadAdminFile,
  documentDownloadUrl,
  documentIconClass,
} from '../../services/adminDataApi'
import './admin.css'

const DETAIL_TABS = ['Overview', 'Documents', 'Activity Log']
const ASSOCIATE_WORKFLOW_STATUSES = ['Inquiry Submitted', 'Verification In progress', 'Verified']
const ACCEPTED_FILE_TYPES = '.pdf,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png'
const EDUCATIONAL_STATUSES = [
  '10th Pass',
  '12th Pass',
  'Diploma',
  'Graduate',
  'Post Graduate',
  'Doctorate',
  'Other',
]

function getStatusClass(status) {
  if (status === 'Verified') return 'accepted'
  if (status === 'Verification In progress') return 'pending'
  return 'submitted'
}

function formatFileSize(bytes) {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileType(fileName) {
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (extension === 'pdf') return 'PDF'
  if (extension === 'xls' || extension === 'xlsx') return 'Excel'
  if (extension === 'doc' || extension === 'docx') return 'Word'
  if (['jpg', 'jpeg', 'png'].includes(extension)) return 'Image'
  return 'File'
}

// Mirrors the server-side admin patch whitelist for this collection.
const PATCHABLE_FIELDS = [
  'firstName',
  'middleName',
  'lastName',
  'email',
  'mobile',
  'profession',
  'dob',
  'educationalStatus',
  'aadhaarNumber',
  'panNumber',
  'bankAccount',
  'ifscCode',
  'upiId',
  'status',
  'notes',
  'documents',
]

function AdminBusinessAssociateDetail() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const { associateId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const backPath = location.state?.from || '/admin/business-associates'

  const [associate, setAssociate] = useState(null)
  const [draftAssociate, setDraftAssociate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [editingCard, setEditingCard] = useState(null)
  const [activeTab, setActiveTab] = useState('Overview')
  const [notes, setNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [uploadingDocId, setUploadingDocId] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [newFieldName, setNewFieldName] = useState('')
  const [editingFieldId, setEditingFieldId] = useState(null)
  const [editingFieldName, setEditingFieldName] = useState('')
  const [syncResult, setSyncResult] = useState(null) // { success: boolean, message: string }
  const autoSyncedAssociateId = useRef('')

  const reload = useCallback(async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const fresh = await fetchAdminBusinessAssociate(associateId)
      setAssociate(fresh)
      setDraftAssociate(fresh)
      setNotes(fresh?.notes || '')
    } catch (err) {
      setErrorMsg(err?.message || 'Could not load business associate.')
    } finally {
      setLoading(false)
    }
  }, [associateId])

  useEffect(() => {
    reload()
  }, [reload])

  const syncUserRole = useCallback(async (targetAssociate = associate, { silent = false } = {}) => {
    if (!targetAssociate) return false

    if (!silent) setSyncResult(null)
    try {
      let uid = targetAssociate.submittedByUid

      if (!uid && targetAssociate.email) {
        const userRec = await findUserByEmail(targetAssociate.email)
        if (userRec) {
          uid = userRec.id
        }
      }

      if (uid) {
        await setAdminUserRole(uid, 'Associate')
        if (!silent) {
          setSyncResult({ success: true, message: 'User role synced successfully!' })
        }
        return true
      }

      const message = 'No user account found for this email.'
      if (silent) {
        setErrorMsg(message)
      } else {
        setSyncResult({ success: false, message })
      }
      return false
    } catch (err) {
      console.error('Failed to sync user role:', err)
      const message = `Sync failed: ${err.message}`
      if (silent) {
        setErrorMsg(message)
      } else {
        setSyncResult({ success: false, message })
      }
      return false
    } finally {
      if (!silent) {
        setTimeout(() => setSyncResult(null), 3000)
      }
    }
  }, [associate])

  useEffect(() => {
    if (associate?.status !== 'Verified') return
    if (autoSyncedAssociateId.current === associate.id) return
    autoSyncedAssociateId.current = associate.id
    syncUserRole(associate, { silent: true })
  }, [associate, syncUserRole])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (loading) {
    return (
      <AdminShell title="Business Associate" subtitle="Loading…">
        <section className="admin-users-card admin-not-found-card">
          <div className="admin-users-empty">
            <i className="fa-regular fa-clock" aria-hidden="true"></i>
            <strong>Loading associate…</strong>
            <span>Pulling fresh data from Firestore.</span>
          </div>
        </section>
      </AdminShell>
    )
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
            <strong>{errorMsg || 'Business associate not found'}</strong>
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

  // Optimistically apply the change locally, then PATCH the API with diffed fields.
  const syncAssociate = (updater) => {
    const updated = updater(associate)
    setAssociate(updated)
    setDraftAssociate(updated)

    const patch = {}
    for (const field of PATCHABLE_FIELDS) {
      if (updated[field] !== undefined && updated[field] !== associate[field]) {
        patch[field] = updated[field]
      }
    }
    if (Object.keys(patch).length > 0) {
      updateAdminBusinessAssociate(associate.id, patch).catch((err) => {
        setErrorMsg(err?.message || 'Could not save changes.')
      })
    }
    return updated
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

  const updateStatus = async (status) => {
    const updatedAssociate = syncAssociate((currentAssociate) => ({ ...currentAssociate, status }))

    if (status === 'Verified') {
      autoSyncedAssociateId.current = updatedAssociate.id
      await syncUserRole(updatedAssociate)
    }
  }

  const addDocumentField = () => {
    const fieldName = newFieldName.trim()
    if (!fieldName) return

    const next = [
      ...(associate.documents || []),
      {
        id: `doc-${Date.now()}`,
        fieldName,
        file: null,
      },
    ]
    syncAssociate((currentAssociate) => ({ ...currentAssociate, documents: next }))
    setNewFieldName('')
  }

  const attachDocument = async (documentId, file) => {
    if (!file) return

    setUploadingDocId(documentId)
    setErrorMsg('')
    try {
      const uploaded = await uploadAdminFile(
        file,
        `startupcredit/business-associates/${associate.id}`
      )
      uploaded.type = uploaded.type || getFileType(file.name)
      uploaded.size = uploaded.size || formatFileSize(file.size)
      uploaded.uploadedOn =
        uploaded.uploadedOn ||
        new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })

      syncAssociate((currentAssociate) => ({
        ...currentAssociate,
        documents: currentAssociate.documents.map((document) =>
          document.id === documentId ? { ...document, file: uploaded } : document
        ),
      }))
    } catch (err) {
      setErrorMsg(err?.message || 'Could not upload file. Please try again.')
    } finally {
      setUploadingDocId(null)
    }
  }

  const removeDocument = (documentId) => {
    syncAssociate((currentAssociate) => ({
      ...currentAssociate,
      documents: currentAssociate.documents.map((document) =>
        document.id === documentId ? { ...document, file: null } : document,
      ),
    }))
  }

  const renameDocumentField = (documentId, newName) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    syncAssociate((currentAssociate) => ({
      ...currentAssociate,
      documents: (currentAssociate.documents || []).map((doc) =>
        doc.id === documentId ? { ...doc, fieldName: trimmed } : doc
      ),
    }))
  }

  const deleteDocumentField = (documentId) => {
    syncAssociate((currentAssociate) => ({
      ...currentAssociate,
      documents: (currentAssociate.documents || []).filter((doc) => doc.id !== documentId),
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
      {errorMsg && (
        <div style={{ padding: '12px 18px', margin: '12px 0', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
          {errorMsg}
        </div>
      )}

      <section className="admin-users-card admin-investor-detail-card">
        <header className="admin-investor-detail-header">
          <div className="admin-investor-identity">
            <span>{associate.avatar}</span>
            <div>
              <h2>{fullName}</h2>
              <p>{associate.profession}</p>
            </div>
          </div>

          <div className="admin-investor-status-actions">
            {associate.status !== 'Verified' ? (
              <>
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
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {syncResult && (
                  <span style={{ 
                    fontSize: '12px', 
                    color: syncResult.success ? '#059669' : '#dc2626',
                    fontWeight: 600
                  }}>
                    {syncResult.message}
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        <article className="admin-workflow-card admin-detail-workflow-card">
          <header className="admin-section-header">
            <h2>Business Associate Workflow</h2>
            <span>{ASSOCIATE_WORKFLOW_STATUSES.indexOf(associate.status) + 1} of {ASSOCIATE_WORKFLOW_STATUSES.length} stages completed</span>
          </header>
          <div className="admin-stepper">
            {ASSOCIATE_WORKFLOW_STATUSES.map((status, index) => {
              const currentStatusIndex = ASSOCIATE_WORKFLOW_STATUSES.indexOf(associate.status)
              const isVerified = associate.status === 'Verified'
              const isCompleted = index <= currentStatusIndex
              const isLineCompleted = index < currentStatusIndex
              const isCurrent = index === currentStatusIndex
              let stepClass = 'admin-step'
              if (isCompleted) stepClass += ' completed'
              if (isLineCompleted) stepClass += ' line-completed'
              if (isCurrent) stepClass += ' active'

              return (
                <div key={status} className={stepClass}>
                  <div className="admin-step-content">
                    <button
                      className="admin-step-circle"
                      disabled={isVerified}
                      onClick={() => updateStatus(status)}
                      title={isVerified ? 'Business associate workflow is locked' : `Update stage to: ${status}`}
                      type="button"
                    >
                      {isCompleted ? <i className="fa-solid fa-check" aria-hidden="true"></i> : index + 1}
                    </button>
                    <span className="admin-step-label">{status}</span>
                  </div>
                  {index < ASSOCIATE_WORKFLOW_STATUSES.length - 1 && <div className="admin-step-line"></div>}
                </div>
              )
            })}
          </div>
        </article>

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
                      <select value={draftAssociate.educationalStatus || ''} onChange={(e) => setDraftAssociate({ ...draftAssociate, educationalStatus: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                        <option value="">Educational Status</option>
                        {EDUCATIONAL_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
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
            <article className="admin-detail-card admin-bordered-card admin-documents-card">
              <header className="admin-section-header admin-documents-header">
                <h2>Documents</h2>
                <div className="admin-add-field">
                  <input
                    aria-label="New document field name"
                    onChange={(event) => setNewFieldName(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && addDocumentField()}
                    placeholder="New field name..."
                    type="text"
                    value={newFieldName}
                  />
                  <button onClick={addDocumentField} type="button">
                    <i className="fa-solid fa-plus" aria-hidden="true"></i>
                    Add Field
                  </button>
                </div>
              </header>

              <div className="admin-documents-list">
                {(associate.documents || []).map((document) => (
                  <div className="admin-document-row" key={document.id}>
                    <div>
                      {editingFieldId === document.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={editingFieldName}
                          onChange={(e) => setEditingFieldName(e.target.value)}
                          onBlur={() => { renameDocumentField(document.id, editingFieldName); setEditingFieldId(null); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { renameDocumentField(document.id, editingFieldName); setEditingFieldId(null); } }}
                          style={{ padding: '0.2rem', fontSize: 'inherit', maxWidth: '260px', fontWeight: 700 }}
                        />
                      ) : (
                        <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          <i
                            className={documentIconClass(document.file)}
                            aria-hidden="true"
                            style={{ color: '#1c65d1' }}
                          />
                          {document.fieldName}
                        </strong>
                      )}
                      {uploadingDocId === document.id ? (
                        <span style={{ color: '#1c65d1', fontStyle: 'italic' }}>Uploading…</span>
                      ) : document.file ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span>{document.file.name}</span>
                          <span>· {document.file.type} · {document.file.size} · {document.file.uploadedOn}</span>
                        </span>
                      ) : (
                        <span>No document uploaded</span>
                      )}
                    </div>
                    <div className="admin-document-actions">
                      <label>
                        <i className="fa-solid fa-upload" aria-hidden="true"></i>
                        {document.file ? 'Replace' : 'Upload'}
                        <input
                          accept={ACCEPTED_FILE_TYPES}
                          onChange={(event) => attachDocument(document.id, event.target.files[0])}
                          disabled={uploadingDocId === document.id}
                          type="file"
                        />
                      </label>
                      {document.file?.url && (
                        <button
                          type="button"
                          className="admin-link-button secondary"
                          onClick={() =>
                            setPreviewDoc({ file: document.file, title: document.fieldName })
                          }
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <i className="fa-solid fa-eye" aria-hidden="true"></i>
                          View
                        </button>
                      )}
                      {documentDownloadUrl(document.file) && (
                        <a
                          className="admin-link-button secondary"
                          href={documentDownloadUrl(document.file)}
                          download
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <i className="fa-solid fa-download" aria-hidden="true"></i>
                          Download
                        </a>
                      )}
                      <button
                        disabled={!document.file}
                        onClick={() => removeDocument(document.id)}
                        type="button"
                      >
                        Remove File
                      </button>
                      <button
                        className="danger"
                        onClick={() => deleteDocumentField(document.id)}
                        type="button"
                      >
                        Delete Field
                      </button>
                      <button
                        onClick={() => {
                          setEditingFieldId(document.id)
                          setEditingFieldName(document.fieldName)
                        }}
                        type="button"
                        title="Rename field"
                      >
                        <i className="fa-solid fa-pencil" aria-hidden="true"></i>
                        Rename
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

      <DocumentPreviewModal
        open={Boolean(previewDoc)}
        file={previewDoc?.file}
        title={previewDoc?.title}
        onClose={() => setPreviewDoc(null)}
      />
    </AdminShell>
  )
}

export default AdminBusinessAssociateDetail
