import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AdminShell from './AdminShell'
import { PROJECT_STATUSES, getProjectById, updateProject } from './adminProjectData'

const ACCEPTED_FILE_TYPES = '.pdf,.xls,.xlsx,.doc,.docx'

function getStatusClass(status) {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, '-')
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

function AdminProjectDetail() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const { projectId } = useParams()
  const [project, setProject] = useState(() => getProjectById(projectId))
  const [newFieldName, setNewFieldName] = useState('')
  const [draftNotes, setDraftNotes] = useState(project?.notes || '')
  const [notesSaved, setNotesSaved] = useState(false)

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
    return updatedProject
  }

  const changeStatus = (status) => {
    syncProject((currentProject) => ({
      ...currentProject,
      status,
      lastUpdated: 'Today',
    }))
  }

  const addDocumentField = () => {
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
    }))
    setNewFieldName('')
  }

  const attachFile = (documentId, file) => {
    if (!file) {
      return
    }

    syncProject((currentProject) => ({
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
    }))
  }

  const removeFile = (documentId) => {
    syncProject((currentProject) => ({
      ...currentProject,
      documents: currentProject.documents.map((document) =>
        document.id === documentId ? { ...document, file: null } : document,
      ),
      lastUpdated: 'Today',
    }))
  }

  const deleteDocumentField = (documentId) => {
    syncProject((currentProject) => ({
      ...currentProject,
      documents: currentProject.documents.filter((document) => document.id !== documentId),
      lastUpdated: 'Today',
    }))
  }

  const saveNotes = () => {
    syncProject((currentProject) => ({
      ...currentProject,
      notes: draftNotes,
      lastUpdated: 'Today',
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
        <Link className="admin-link-button secondary" to="/admin/projects">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          Back to Projects
        </Link>
        <span className={`admin-project-status ${getStatusClass(project.status)}`}>
          {project.status}
        </span>
      </div>

      <article className="admin-users-card admin-workflow-card">
        <header className="admin-section-header">
          <h2>Project Workflow</h2>
          <span>{PROJECT_STATUSES.indexOf(project.status) + 1} of {PROJECT_STATUSES.length} stages completed</span>
        </header>
        <div className="admin-workflow-list">
          {PROJECT_STATUSES.map((status, index) => {
            const currentStatusIndex = PROJECT_STATUSES.indexOf(project.status)
            const isPast = index < currentStatusIndex
            const isCurrent = index === currentStatusIndex
            const isFuture = index > currentStatusIndex
            const isClickable = index >= currentStatusIndex

            let chipClass = 'admin-workflow-chip'
            if (isPast) chipClass += ' completed'
            if (isCurrent) chipClass += ' current'
            if (!isClickable) chipClass += ' disabled'

            return (
              <button
                className={chipClass}
                disabled={!isClickable}
                key={status}
                onClick={() => isClickable && changeStatus(status)}
                type="button"
              >
                <span className="admin-workflow-step">
                  {isPast ? <i className="fa-solid fa-check" aria-hidden="true"></i> : index + 1}
                </span>
                {status}
              </button>
            )
          })}
        </div>
      </article>

      <section className="admin-project-detail-grid">
        <article className="admin-users-card admin-detail-card">
          <header className="admin-section-header">
            <h2>Project Information</h2>
          </header>

          <div className="admin-detail-grid project-info-grid">
            <div>
              <span>Project Title</span>
              <strong>{project.projectTitle}</strong>
            </div>
            <div>
              <span>NIC Code</span>
              <strong>{project.nicCode} - {project.nicName}</strong>
            </div>
            <div>
              <span>Project Sector</span>
              <strong>{project.sectionName}</strong>
            </div>
            <div>
              <span>Project Division</span>
              <strong>{project.divisionName}</strong>
            </div>
            <div>
              <span>Project Group</span>
              <strong>{project.groupName}</strong>
            </div>
            <div>
              <span>Project Class</span>
              <strong>{project.className}</strong>
            </div>
            <div className="admin-detail-wide">
              <span>Project Description</span>
              <p>{project.projectDescription}</p>
            </div>
          </div>
        </article>

        <article className="admin-users-card admin-detail-card">
          <header className="admin-section-header">
            <h2>Client Information</h2>
          </header>

          <div className="admin-detail-grid project-info-grid">
            <div>
              <span>Submitted By</span>
              <strong>{project.submittedByType}</strong>
            </div>
            <div>
              <span>Name</span>
              <strong>{project.clientName}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{project.clientEmail}</strong>
            </div>
            <div>
              <span>Mobile</span>
              <strong>{project.clientPhone}</strong>
            </div>
            <div>
              <span>Organization</span>
              <strong>{project.organization}</strong>
            </div>
            <div>
              <span>Designation</span>
              <strong>{project.designation}</strong>
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
                    <span>{document.file.name} · {document.file.type} · {document.file.size} · {document.file.uploadedOn}</span>
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
            value={draftNotes}
          ></textarea>
          <div className="admin-notes-actions">
            {notesSaved && <span>Notes saved</span>}
            <button onClick={saveNotes} type="button">Save Notes</button>
          </div>
        </article>
      </section>
    </AdminShell>
  )
}

export default AdminProjectDetail
