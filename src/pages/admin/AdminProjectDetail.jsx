import { useState } from 'react'
import { Link, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom'
import AdminShell from './AdminShell'
import { PROJECT_STATUSES, getProjectById, updateProject } from './adminProjectData'

const ACCEPTED_FILE_TYPES = '.pdf,.xls,.xlsx,.doc,.docx'

function getStatusClass(status) {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function isProjectCompleted(status) {
  return status === 'Project Completed'
}

function formatFileSize(bytes) {
  if (!bytes) {
    return '0 KB'
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileType(fileName) {
  const extension = fileName.split('.').pop()?.toLowerCase()

  if (extension === 'pdf') return 'PDF'
  if (extension === 'xls' || extension === 'xlsx') return 'Excel'
  if (extension === 'doc' || extension === 'docx') return 'Word'
  return 'File'
}

function createHistoryEntry(actionDescription) {
  const now = new Date()
  const dateOptions = { month: 'long' }
  const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true }
  
  const day = now.getDate()
  const suffix = ["th", "st", "nd", "rd"][((day % 100) - 20) % 10] || ["th", "st", "nd", "rd"][day % 100] || "th"
  const dateStr = `${day}${suffix} ${now.toLocaleDateString('en-US', dateOptions)}`

  return {
    id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    action: `admin@startupcredit.in ${actionDescription}`,
    date: dateStr,
    time: now.toLocaleTimeString('en-US', timeOptions),
  }
}

function AdminProjectDetail() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const { projectId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const backPath = location.state?.from || '/admin/projects'
  const [project, setProject] = useState(() => getProjectById(projectId))
  const [draftProject, setDraftProject] = useState(() => getProjectById(projectId))
  const [editingCard, setEditingCard] = useState(null)
  const [newFieldName, setNewFieldName] = useState('')
  const [draftNotes, setDraftNotes] = useState(project?.notes || '')
  const [notesSaved, setNotesSaved] = useState(false)
  const [editingFileId, setEditingFileId] = useState(null)
  const [editingFileName, setEditingFileName] = useState('')
  const [lockedAction, setLockedAction] = useState(null)

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (!project) {
    return (
      <AdminShell
        title="Project Not Found"
        subtitle="The requested project could not be found."
      >
        <section className="admin-users-card admin-not-found-card">
          <div className="admin-users-empty">
            <i className="fa-regular fa-folder-open" aria-hidden="true"></i>
            <strong>Project not found</strong>
            <span>Open Project Management and choose a valid active project.</span>
            <Link className="admin-link-button" to="/admin/projects">Back to Projects</Link>
          </div>
        </section>
      </AdminShell>
    )
  }

  const syncProject = (updater) => {
    const updatedProject = updateProject(project.id, updater)
    setProject(updatedProject)
    setDraftProject(updatedProject)
    return updatedProject
  }

  const showLockedMessage = (actionTitle = 'Project locked') => {
    setLockedAction({
      title: actionTitle,
      message: 'This project is marked completed, so its status, details, description, files, notes, and other fields cannot be edited further.',
    })
  }

  const canEditProject = (actionTitle) => {
    if (!isProjectCompleted(project.status)) {
      return true
    }

    showLockedMessage(actionTitle)
    return false
  }

  const saveEdits = (cardName) => {
    if (!canEditProject('Details locked')) {
      return
    }

    syncProject((currentProject) => {
      let changes = {}
      let actionText = ''

      if (cardName === 'projectInfo') {
        changes = {
          projectTitle: draftProject.projectTitle,
          nicCode: draftProject.nicCode,
          nicName: draftProject.nicName,
          sectionName: draftProject.sectionName,
          divisionName: draftProject.divisionName,
          groupName: draftProject.groupName,
          className: draftProject.className,
          projectDescription: draftProject.projectDescription,
        }
        actionText = 'edited Project Information'
      } else if (cardName === 'clientInfo') {
        changes = {
          submittedByType: draftProject.submittedByType,
          associateName: draftProject.associateName,
          associateEmail: draftProject.associateEmail,
          clientName: draftProject.clientName,
          clientEmail: draftProject.clientEmail,
          clientPhone: draftProject.clientPhone,
        }
        actionText = 'edited Client Information'
      }

      return {
        ...currentProject,
        ...changes,
        lastUpdated: 'Today',
        history: [
          ...(currentProject.history || []),
          createHistoryEntry(actionText),
        ],
      }
    })
    setEditingCard(null)
  }

  const changeStatus = (status) => {
    if (status === project.status) {
      return
    }

    if (isProjectCompleted(project.status) && status !== project.status) {
      showLockedMessage('Status locked')
      return
    }

    const updatedProject = syncProject((currentProject) => ({
      ...currentProject,
      status,
      lastUpdated: 'Today',
      history: [
        ...(currentProject.history || []),
        createHistoryEntry(`changed status to "${status}"`),
      ],
    }))

    if (isProjectCompleted(updatedProject.status)) {
      setEditingCard(null)
      setEditingFileId(null)
    }
  }

  const addDocumentField = () => {
    if (!canEditProject('Documents locked')) {
      return
    }

    const fieldName = newFieldName.trim()

    if (!fieldName) {
      return
    }

    syncProject((currentProject) => ({
      ...currentProject,
      documents: [
        ...currentProject.documents,
        {
          id: `doc-${Date.now()}`,
          fieldName,
          file: null,
        },
      ],
      lastUpdated: 'Today',
      history: [
        ...(currentProject.history || []),
        createHistoryEntry(`added a new document field named "${fieldName}"`),
      ],
    }))
    setNewFieldName('')
  }

  const attachFile = (documentId, file) => {
    if (!canEditProject('Files locked')) {
      return
    }

    if (!file) {
      return
    }

    syncProject((currentProject) => {
      const documentName = currentProject.documents.find(d => d.id === documentId)?.fieldName || 'document'
      return {
        ...currentProject,
        documents: currentProject.documents.map((document) =>
          document.id === documentId
            ? {
                ...document,
                file: {
                  name: file.name,
                  type: getFileType(file.name),
                  size: formatFileSize(file.size),
                  uploadedOn: 'Today',
                },
              }
            : document,
        ),
        lastUpdated: 'Today',
        history: [
          ...(currentProject.history || []),
          createHistoryEntry(`uploaded file "${file.name}" to "${documentName}"`),
        ],
      }
    })
  }

  const removeFile = (documentId) => {
    if (!canEditProject('Files locked')) {
      return
    }

    syncProject((currentProject) => {
      const documentName = currentProject.documents.find(d => d.id === documentId)?.fieldName || 'document'
      return {
        ...currentProject,
        documents: currentProject.documents.map((document) =>
          document.id === documentId ? { ...document, file: null } : document,
        ),
        lastUpdated: 'Today',
        history: [
          ...(currentProject.history || []),
          createHistoryEntry(`removed the file from "${documentName}"`),
        ],
      }
    })
  }

  const renameFile = (documentId, newName) => {
    if (!canEditProject('Files locked')) {
      return
    }

    if (!newName.trim()) return
    syncProject((currentProject) => {
      const doc = currentProject.documents.find(d => d.id === documentId)
      const oldName = doc?.file?.name
      if (!doc || !doc.file || oldName === newName) return currentProject

      return {
        ...currentProject,
        documents: currentProject.documents.map((document) =>
          document.id === documentId
            ? { ...document, file: { ...document.file, name: newName.trim() } }
            : document
        ),
        lastUpdated: 'Today',
        history: [
          ...(currentProject.history || []),
          createHistoryEntry(`renamed file in "${doc.fieldName}" from "${oldName}" to "${newName.trim()}"`),
        ],
      }
    })
  }

  const deleteDocumentField = (documentId) => {
    if (!canEditProject('Documents locked')) {
      return
    }

    syncProject((currentProject) => {
      const documentName = currentProject.documents.find(d => d.id === documentId)?.fieldName || 'document'
      return {
        ...currentProject,
        documents: currentProject.documents.filter((document) => document.id !== documentId),
        lastUpdated: 'Today',
        history: [
          ...(currentProject.history || []),
          createHistoryEntry(`deleted the document field "${documentName}"`),
        ],
      }
    })
  }

  const saveNotes = () => {
    if (!canEditProject('Notes locked')) {
      return
    }

    syncProject((currentProject) => ({
      ...currentProject,
      notes: draftNotes,
      lastUpdated: 'Today',
      history: [
        ...(currentProject.history || []),
        createHistoryEntry(`edited the additional notes`),
      ],
    }))
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 1800)
  }

  return (
    <AdminShell
      title={project.projectTitle}
      subtitle="Manage project details, documents, notes, and filing progress."
    >
      <div className="admin-detail-page-actions">
        <button
          className="admin-link-button secondary"
          onClick={() => navigate(backPath)}
          type="button"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          Back
        </button>
        <span className={`admin-project-status ${getStatusClass(project.status)}`}>
          {project.status}
        </span>
      </div>

      <article className="admin-users-card admin-workflow-card">
        <header className="admin-section-header">
          <h2>Project Workflow</h2>
          <span>{PROJECT_STATUSES.indexOf(project.status) + 1} of {PROJECT_STATUSES.length} stages completed</span>
        </header>
        <div className="admin-stepper">
          {PROJECT_STATUSES.map((status, index) => {
            const currentStatusIndex = PROJECT_STATUSES.indexOf(project.status)
            const isCompleted = index < currentStatusIndex
            const isCurrent = index === currentStatusIndex

            let stepClass = 'admin-step'
            if (isCompleted) stepClass += ' completed'
            if (isCurrent) stepClass += ' active'

            return (
              <div key={status} className={stepClass}>
                <div className="admin-step-content">
                  <button
                    className="admin-step-circle"
                    onClick={() => changeStatus(status)}
                    title={`Update stage to: ${status}`}
                    type="button"
                  >
                    {isCompleted ? <i className="fa-solid fa-check" aria-hidden="true"></i> : index + 1}
                  </button>
                  <span className="admin-step-label">{status}</span>
                </div>
                {index < PROJECT_STATUSES.length - 1 && <div className="admin-step-line"></div>}
              </div>
            )
          })}
        </div>
      </article>

      <section className="admin-project-detail-grid">
        <article className="admin-users-card admin-detail-card">
          <header className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Project Information</h2>
            {editingCard === 'projectInfo' ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="admin-link-button secondary" onClick={() => { setDraftProject(project); setEditingCard(null); }} type="button" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Cancel</button>
                <button className="admin-link-button" onClick={() => saveEdits('projectInfo')} type="button" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Save</button>
              </div>
            ) : (
              <button onClick={() => canEditProject('Details locked') && setEditingCard('projectInfo')} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.25rem' }} title="Edit Project Information">
                <i className="fa-solid fa-pencil" aria-hidden="true"></i>
              </button>
            )}
          </header>

          <div className="admin-detail-grid project-info-grid">
            <div>
              <span>Project Title</span>
              {editingCard === 'projectInfo' ? (
                <input type="text" value={draftProject.projectTitle} onChange={(e) => setDraftProject({ ...draftProject, projectTitle: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
              ) : (
                <strong>{project.projectTitle}</strong>
              )}
            </div>
            <div>
              <span>NIC Code</span>
              {editingCard === 'projectInfo' ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" value={draftProject.nicCode} onChange={(e) => setDraftProject({ ...draftProject, nicCode: e.target.value })} style={{ padding: '0.2rem', width: '80px', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} placeholder="Code" />
                  <input type="text" value={draftProject.nicName} onChange={(e) => setDraftProject({ ...draftProject, nicName: e.target.value })} style={{ padding: '0.2rem', flex: 1, fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} placeholder="Name" />
                </div>
              ) : (
                <strong>{project.nicCode} - {project.nicName}</strong>
              )}
            </div>
            <div>
              <span>Project Sector</span>
              {editingCard === 'projectInfo' ? (
                <input type="text" value={draftProject.sectionName} onChange={(e) => setDraftProject({ ...draftProject, sectionName: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
              ) : (
                <strong>{project.sectionName}</strong>
              )}
            </div>
            <div>
              <span>Project Division</span>
              {editingCard === 'projectInfo' ? (
                <input type="text" value={draftProject.divisionName} onChange={(e) => setDraftProject({ ...draftProject, divisionName: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
              ) : (
                <strong>{project.divisionName}</strong>
              )}
            </div>
            <div>
              <span>Project Group</span>
              {editingCard === 'projectInfo' ? (
                <input type="text" value={draftProject.groupName} onChange={(e) => setDraftProject({ ...draftProject, groupName: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
              ) : (
                <strong>{project.groupName}</strong>
              )}
            </div>
            <div>
              <span>Project Class</span>
              {editingCard === 'projectInfo' ? (
                <input type="text" value={draftProject.className} onChange={(e) => setDraftProject({ ...draftProject, className: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
              ) : (
                <strong>{project.className}</strong>
              )}
            </div>
            <div className="admin-detail-wide">
              <span>Project Description</span>
              {editingCard === 'projectInfo' ? (
                <textarea value={draftProject.projectDescription} onChange={(e) => setDraftProject({ ...draftProject, projectDescription: e.target.value })} style={{ padding: '0.4rem', width: '100%', minHeight: '80px', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px', resize: 'vertical' }} />
              ) : (
                <p>{project.projectDescription}</p>
              )}
            </div>
          </div>
        </article>

        <article className="admin-users-card admin-detail-card">
          <header className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Client Information</h2>
            {editingCard === 'clientInfo' ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="admin-link-button secondary" onClick={() => { setDraftProject(project); setEditingCard(null); }} type="button" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Cancel</button>
                <button className="admin-link-button" onClick={() => saveEdits('clientInfo')} type="button" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Save</button>
              </div>
            ) : (
              <button onClick={() => canEditProject('Details locked') && setEditingCard('clientInfo')} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.25rem' }} title="Edit Client Information">
                <i className="fa-solid fa-pencil" aria-hidden="true"></i>
              </button>
            )}
          </header>

          <div className="admin-detail-grid project-info-grid">
            <div>
              <span>Submitted By</span>
              {editingCard === 'clientInfo' ? (
                <select value={draftProject.submittedByType} onChange={(e) => setDraftProject({ ...draftProject, submittedByType: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <option value="Self">Self</option>
                  <option value="Business Associate">Business Associate</option>
                </select>
              ) : (
                <strong>{project.submittedByType}</strong>
              )}
            </div>
            {((editingCard === 'clientInfo' && draftProject.submittedByType === 'Business Associate') || (editingCard !== 'clientInfo' && project.submittedByType === 'Business Associate')) && (
              <>
                <div>
                  <span>Associate Name</span>
                  {editingCard === 'clientInfo' ? (
                    <input type="text" value={draftProject.associateName || ''} onChange={(e) => setDraftProject({ ...draftProject, associateName: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                  ) : (
                    <strong>{project.associateName}</strong>
                  )}
                </div>
                <div>
                  <span>Associate Email</span>
                  {editingCard === 'clientInfo' ? (
                    <input type="email" value={draftProject.associateEmail || ''} onChange={(e) => setDraftProject({ ...draftProject, associateEmail: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
                  ) : (
                    <strong>{project.associateEmail}</strong>
                  )}
                </div>
              </>
            )}
            <div>
              <span>Client Name</span>
              {editingCard === 'clientInfo' ? (
                <input type="text" value={draftProject.clientName} onChange={(e) => setDraftProject({ ...draftProject, clientName: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
              ) : (
                <strong>{project.clientName}</strong>
              )}
            </div>
            <div>
              <span>Email</span>
              {editingCard === 'clientInfo' ? (
                <input type="email" value={draftProject.clientEmail} onChange={(e) => setDraftProject({ ...draftProject, clientEmail: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
              ) : (
                <strong>{project.clientEmail}</strong>
              )}
            </div>
            <div>
              <span>Mobile</span>
              {editingCard === 'clientInfo' ? (
                <input type="text" value={draftProject.clientPhone} onChange={(e) => setDraftProject({ ...draftProject, clientPhone: e.target.value })} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
              ) : (
                <strong>{project.clientPhone}</strong>
              )}
            </div>
          </div>
        </article>

        <article className="admin-users-card admin-detail-card admin-documents-card">
          <header className="admin-section-header admin-documents-header">
            <h2>Documents</h2>
            <div className="admin-add-field">
              <input
                aria-label="New document field name"
                onChange={(event) => setNewFieldName(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && addDocumentField()}
                placeholder="New field name..."
                readOnly={isProjectCompleted(project.status)}
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
            {project.documents.map((document) => (
              <div className="admin-document-row" key={document.id}>
                <div>
                  <strong>{document.fieldName}</strong>
                  {document.file ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {editingFileId === document.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={editingFileName}
                          onChange={(e) => setEditingFileName(e.target.value)}
                          onBlur={() => { renameFile(document.id, editingFileName); setEditingFileId(null); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { renameFile(document.id, editingFileName); setEditingFileId(null); } }}
                          style={{ padding: '0.2rem', fontSize: 'inherit', maxWidth: '200px' }}
                        />
                      ) : (
                        <span>{document.file.name}</span>
                      )}
                      <span>· {document.file.type} · {document.file.size} · {document.file.uploadedOn}</span>
                    </span>
                  ) : (
                    <span>No document uploaded</span>
                  )}
                </div>
                <div className="admin-document-actions">
                  <label onClick={(event) => {
                    if (isProjectCompleted(project.status)) {
                      event.preventDefault()
                      showLockedMessage('Files locked')
                    }
                  }}>
                    <i className="fa-solid fa-upload" aria-hidden="true"></i>
                    {document.file ? 'Replace' : 'Upload'}
                    <input
                      accept={ACCEPTED_FILE_TYPES}
                      onChange={(event) => attachFile(document.id, event.target.files[0])}
                      disabled={isProjectCompleted(project.status)}
                      type="file"
                    />
                  </label>
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
                  {document.file && (
                    <button
                      onClick={() => {
                        if (canEditProject('Files locked')) {
                          setEditingFileId(document.id)
                          setEditingFileName(document.file.name)
                        }
                      }}
                      type="button"
                      title="Rename file"
                    >
                      <i className="fa-solid fa-pencil" aria-hidden="true"></i>
                      Rename
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-users-card admin-detail-card">
          <header className="admin-section-header">
            <h2>Additional Notes</h2>
          </header>
          <textarea
            className="admin-notes-textarea"
            onChange={(event) => setDraftNotes(event.target.value)}
            placeholder="Add any additional notes or comments about this project..."
            readOnly={isProjectCompleted(project.status)}
            value={draftNotes}
          ></textarea>
          <div className="admin-notes-actions">
            {notesSaved && <span>Changes saved</span>}
            <button onClick={saveNotes} type="button">Save Changes</button>
          </div>
        </article>

        <article className="admin-users-card admin-detail-card">
          <header className="admin-section-header">
            <h2>History</h2>
          </header>
          <div className="admin-history-list">
            {project.history && project.history.length > 0 ? (
              [...project.history].reverse().map((entry) => (
                <div key={entry.id} className="admin-history-item" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    <strong>{entry.action.split(' ')[0]}</strong> {entry.action.substring(entry.action.indexOf(' ') + 1)}
                  </p>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    Date {entry.date} , Time: {entry.time}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic', padding: '1rem 0', margin: 0 }}>
                No history recorded yet.
              </p>
            )}
          </div>
        </article>
      </section>

      {lockedAction && (
        <div className="admin-modal-backdrop" role="presentation">
          <section
            aria-labelledby="project-detail-locked-title"
            aria-modal="true"
            className="admin-modal admin-confirm-modal"
            role="dialog"
          >
            <header className="admin-modal-header">
              <div>
                <p>Project Completed</p>
                <h2 id="project-detail-locked-title">{lockedAction.title}</h2>
              </div>
              <button
                aria-label="Close project locked message"
                onClick={() => setLockedAction(null)}
                type="button"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </header>
            <div className="admin-modal-body">
              <div className="admin-detail-block">
                <strong>{project.projectTitle}</strong>
                <p>{lockedAction.message}</p>
              </div>
              <div className="admin-modal-actions">
                <button className="admin-link-button" onClick={() => setLockedAction(null)} type="button">
                  Okay
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  )
}

export default AdminProjectDetail
