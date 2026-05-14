import { useCallback, useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminShell from './AdminShell'
import DocumentPreviewModal from '../../components/DocumentPreviewModal'
import {
  fetchAdminInvestor,
  updateAdminInvestor,
  uploadAdminFile,
  documentDownloadUrl,
  documentIconClass,
} from '../../services/adminDataApi'
import './admin.css'

const ACCEPTED_FILE_TYPES = '.pdf,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png'
const ENTITY_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'LLP',
  'Private Limited',
  'Public Limited',
  'Bank',
  'NBFC',
  'AIF',
  'Angel Syndicate',
  'VC Firm',
]
const CHECK_SIZES = [
  'Less than 1 Lakh',
  '1 - 10 Lakhs',
  '10 - 50 Lakhs',
  '50 Lakhs - 1 Crore',
  '1 - 5 Crores',
  '5 - 10 Crores',
  '10 - 25 Crores',
  '25 - 50 Crores',
  '50 - 100 Crores',
  '100 Crores+',
]

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

const INVESTOR_TABS = ['Investor Details', 'Documents', 'Activity Log']
const INVESTOR_WORKFLOW_STATUSES = ['Inquiry Submitted', 'Verification In progress', 'Verified']

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
  const [investor, setInvestor] = useState(null)
  const [draftInvestor, setDraftInvestor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [editingCard, setEditingCard] = useState(null)
  const [activeTab, setActiveTab] = useState('Investor Details')
  const [notes, setNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [documents, setDocuments] = useState([])
  const [previewDoc, setPreviewDoc] = useState(null)
  const [newFieldName, setNewFieldName] = useState('')
  const [uploadingDocId, setUploadingDocId] = useState(null)
  const [editingFieldId, setEditingFieldId] = useState(null)
  const [editingFieldName, setEditingFieldName] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const fresh = await fetchAdminInvestor(investorId)
      setInvestor(fresh)
      setDraftInvestor(fresh)
      setNotes(fresh?.notes || '')
      setDocuments(fresh?.documents || [])
    } catch (err) {
      setErrorMsg(err?.message || 'Could not load investor.')
    } finally {
      setLoading(false)
    }
  }, [investorId])

  useEffect(() => {
    reload()
  }, [reload])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (loading) {
    return (
      <AdminShell title="Investor" subtitle="Loading investor…">
        <section className="admin-users-card admin-not-found-card">
          <div className="admin-users-empty">
            <i className="fa-regular fa-clock" aria-hidden="true"></i>
            <strong>Loading investor…</strong>
            <span>Pulling fresh data from Firestore.</span>
          </div>
        </section>
      </AdminShell>
    )
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
            <strong>{errorMsg || 'Investor not found'}</strong>
            <span>Open Investor Management and choose a valid investor.</span>
            <button className="admin-link-button" onClick={() => navigate('/admin/investors')} type="button">
              Back to Investors
            </button>
          </div>
        </section>
      </AdminShell>
    )
  }

  const persistInvestor = async (patch) => {
    try {
      await updateAdminInvestor(investorId, patch)
    } catch (err) {
      setErrorMsg(err?.message || 'Could not save changes.')
    }
  }

  const updateStatus = (status) => {
    const reviewedOn = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    const reviewedBy = 'Admin User'
    setInvestor((cur) => ({ ...cur, status, reviewedOn, reviewedBy }))
    persistInvestor({ status, reviewedOn, reviewedBy })
  }

  const saveEdits = () => {
    setInvestor(draftInvestor)
    setEditingCard(null)
    persistInvestor({
      investorType: (draftInvestor.investorType || '').toLowerCase(),
      investorName: draftInvestor.name,
      email: draftInvestor.email,
      phone: draftInvestor.phone,
      entityType: draftInvestor.entityType,
      checkSize: draftInvestor.checkSize,
      aadhaarNumber: draftInvestor.aadhaar,
      panNumber: draftInvestor.pan,
    })
  }

  const addDocumentField = () => {
    const fieldName = newFieldName.trim()
    if (!fieldName) return

    const next = [
      ...documents,
      {
        id: `doc-${Date.now()}`,
        fieldName,
        file: null,
      },
    ]
    setDocuments(next)
    persistInvestor({ documents: next })
    setNewFieldName('')
  }

  const attachFile = async (documentId, file) => {
    if (!file) return

    setUploadingDocId(documentId)
    setErrorMsg('')
    try {
      const uploaded = await uploadAdminFile(
        file,
        `startupcredit/investors/${investorId}`
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

      const next = documents.map((doc) =>
        doc.id === documentId ? { ...doc, file: uploaded } : doc
      )
      setDocuments(next)
      persistInvestor({ documents: next })
    } catch (err) {
      setErrorMsg(err?.message || 'Could not upload file. Please try again.')
    } finally {
      setUploadingDocId(null)
    }
  }

  const removeFile = (documentId) => {
    const next = documents.map((doc) =>
      doc.id === documentId ? { ...doc, file: null } : doc
    )
    setDocuments(next)
    persistInvestor({ documents: next })
  }

  const renameDocumentField = (documentId, newName) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    const next = documents.map((doc) =>
      doc.id === documentId ? { ...doc, fieldName: trimmed } : doc
    )
    setDocuments(next)
    persistInvestor({ documents: next })
  }

  const deleteDocumentField = (documentId) => {
    const next = documents.filter((doc) => doc.id !== documentId)
    setDocuments(next)
    persistInvestor({ documents: next })
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
      {errorMsg && (
        <div style={{ padding: '12px 18px', margin: '12px 0', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
          {errorMsg}
        </div>
      )}

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

        <article className="admin-workflow-card admin-detail-workflow-card">
          <header className="admin-section-header">
            <h2>Investor Workflow</h2>
            <span>{Math.max(1, INVESTOR_WORKFLOW_STATUSES.indexOf(investor.status) + 1)} of {INVESTOR_WORKFLOW_STATUSES.length} stages completed</span>
          </header>
          <div className="admin-stepper">
            {INVESTOR_WORKFLOW_STATUSES.map((status, index) => {
              const currentStatusIndex = Math.max(0, INVESTOR_WORKFLOW_STATUSES.indexOf(investor.status))
              const isVerified = investor.status === 'Verified'
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
                      title={isVerified ? 'Investor workflow is locked' : `Update stage to: ${status}`}
                      type="button"
                    >
                      {isCompleted ? <i className="fa-solid fa-check" aria-hidden="true"></i> : index + 1}
                    </button>
                    <span className="admin-step-label">{status}</span>
                  </div>
                  {index < INVESTOR_WORKFLOW_STATUSES.length - 1 && <div className="admin-step-line"></div>}
                </div>
              )
            })}
          </div>
        </article>

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
                        <select value={draftInvestor.entityType || ''} onChange={(e) => setDraftInvestor({ ...draftInvestor, entityType: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                          <option value="">Type of Entity</option>
                          {ENTITY_TYPES.map((entityType) => (
                            <option key={entityType} value={entityType}>{entityType}</option>
                          ))}
                        </select>
                      ) : (
                        <strong>{investor.entityType}</strong>
                      )}
                    </div>
                  )}
                  <div>
                    <span>Average Check Size</span>
                    {editingCard === 'investorInfo' ? (
                      <select value={draftInvestor.checkSize || ''} onChange={(e) => setDraftInvestor({ ...draftInvestor, checkSize: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                        <option value="">Average Check Size</option>
                        {CHECK_SIZES.map((checkSize) => (
                          <option key={checkSize} value={checkSize}>{checkSize}</option>
                        ))}
                      </select>
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
                {documents.map((document) => (
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
                          onChange={(event) => attachFile(document.id, event.target.files[0])}
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
                        onClick={() => removeFile(document.id)}
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
                      persistInvestor({ notes })
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

      <DocumentPreviewModal
        open={Boolean(previewDoc)}
        file={previewDoc?.file}
        title={previewDoc?.title}
        onClose={() => setPreviewDoc(null)}
      />
    </AdminShell>
  )
}

export default AdminInvestorDetail
