import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom'
import AdminShell from './AdminShell'
import DocumentPreviewModal from '../../components/DocumentPreviewModal'
import { PROJECT_STATUSES } from './adminProjectData'
import {
  fetchAdminProjectSubmission,
  updateAdminProjectSubmission,
  uploadAdminFile,
  documentDownloadUrl,
  documentIconClass,
  fetchAdminNicData,
} from '../../services/adminDataApi'

const ACCEPTED_FILE_TYPES = '.pdf,.xls,.xlsx,.doc,.docx'

const formatSectionLabel = (s) => `Section ${s.code} - ${s.name}`
const formatDivisionLabel = (d) => `Division ${d.code} - ${d.name}`
const formatGroupLabel = (g) => `Group ${g.code} - ${g.name}`
const formatClassLabel = (c) => `Class ${c.code} - ${c.name}`
const formatNicCodeLabel = (sc) => `NIC ${sc.code} - ${sc.name}`

const splitCodeLabel = (value) => {
  if (!value) return { code: '', name: '' }
  const idx = value.indexOf(' - ')
  if (idx < 0) return { code: value, name: '' }
  return { code: value.slice(0, idx), name: value.slice(idx + 3) }
}

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

// Fields that the admin patch endpoint accepts (must mirror server.js whitelist).
const PATCHABLE_FIELDS = [
  'projectTitle',
  'projectDescription',
  'projectSection',
  'projectDivision',
  'projectGroup',
  'projectClass',
  'projectNicCode',
  'status',
  'submittedByType',
  'associateName',
  'associateEmail',
  'clientName',
  'clientEmail',
  'clientPhone',
  'notes',
  'documents',
  'history',
]

function AdminProjectDetail() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const { projectId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const backPath = location.state?.from || '/admin/projects'
  const [project, setProject] = useState(null)
  const [draftProject, setDraftProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [editingCard, setEditingCard] = useState(null)
  const [newFieldName, setNewFieldName] = useState('')
  const [draftNotes, setDraftNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [editingFieldId, setEditingFieldId] = useState(null)
  const [editingFieldName, setEditingFieldName] = useState('')
  const [lockedAction, setLockedAction] = useState(null)
  const [pendingCompletion, setPendingCompletion] = useState(false)
  const [uploadingDocId, setUploadingDocId] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [nicDataFull, setNicDataFull] = useState([])
  const [nicLoading, setNicLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const fresh = await fetchAdminProjectSubmission(projectId)
      setProject(fresh)
      setDraftProject(fresh)
      setDraftNotes(fresh?.notes || '')
    } catch (err) {
      setErrorMsg(err?.message || 'Could not load project.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    let cancelled = false
    fetchAdminNicData()
      .then((data) => {
        if (!cancelled) setNicDataFull(data.nicDataFull || [])
      })
      .catch((err) => {
        if (!cancelled) setErrorMsg(err?.message || 'Could not load NIC dropdown data.')
      })
      .finally(() => {
        if (!cancelled) setNicLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (loading) {
    return (
      <AdminShell title="Project" subtitle="Loading project…">
        <section className="admin-users-card admin-not-found-card">
          <div className="admin-users-empty">
            <i className="fa-regular fa-clock" aria-hidden="true"></i>
            <strong>Loading project…</strong>
            <span>Pulling fresh data from Firestore.</span>
          </div>
        </section>
      </AdminShell>
    )
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
            <strong>{errorMsg || 'Project not found'}</strong>
            <span>Open Project Management and choose a valid active project.</span>
            <Link className="admin-link-button" to="/admin/projects">Back to Projects</Link>
          </div>
        </section>
      </AdminShell>
    )
  }

  // Compute next state via the updater, optimistically update locally, then PATCH the API.
  const syncProject = (updater) => {
    const updatedProject = updater(project)
    setProject(updatedProject)
    setDraftProject(updatedProject)

    const patch = {}
    for (const field of PATCHABLE_FIELDS) {
      if (updatedProject[field] !== undefined && updatedProject[field] !== project[field]) {
        patch[field === 'projectNicCode' ? 'nicCode' : field] = updatedProject[field]
      }
    }
    if (Object.keys(patch).length > 0) {
      updateAdminProjectSubmission(project.id, patch).catch((err) => {
        setErrorMsg(err?.message || 'Could not save changes.')
      })
    }
    return updatedProject
  }

  const showLockedMessage = (actionTitle = 'Project cannot be changed') => {
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

  const matchesCodeLabel = (item, value, displayLabel) => {
    if (!item || !value) return false
    const parsed = splitCodeLabel(value)
    return (
      displayLabel === value ||
      String(item.code) === String(parsed.code) ||
      String(item.code) === String(value) ||
      item.name === parsed.name ||
      item.name === value
    )
  }

  const findSection = (value) =>
    nicDataFull.find((section) => matchesCodeLabel(section, value, formatSectionLabel(section)))
  const findDivision = (section, value) =>
    (section?.divisions || []).find((division) => matchesCodeLabel(division, value, formatDivisionLabel(division)))
  const findGroup = (division, value) =>
    (division?.groups || []).find((group) => matchesCodeLabel(group, value, formatGroupLabel(group)))
  const findClass = (group, value) =>
    (group?.classes || []).find((cls) => matchesCodeLabel(cls, value, formatClassLabel(cls)))
  const findNicCode = (cls, value) =>
    (cls?.sub_classes || []).find((sc) => matchesCodeLabel(sc, value, formatNicCodeLabel(sc)))

  const selectedSection = draftProject ? findSection(draftProject.projectSection) : null
  const selectedDivision = draftProject ? findDivision(selectedSection, draftProject.projectDivision) : null
  const selectedGroup = draftProject ? findGroup(selectedDivision, draftProject.projectGroup) : null
  const selectedClass = draftProject ? findClass(selectedGroup, draftProject.projectClass) : null
  const selectedNic = draftProject ? findNicCode(selectedClass, draftProject.projectNicCode || draftProject.nicCode) : null
  const selectedSectionValue = selectedSection ? formatSectionLabel(selectedSection) : draftProject?.projectSection || ''
  const selectedDivisionValue = selectedDivision ? formatDivisionLabel(selectedDivision) : draftProject?.projectDivision || ''
  const selectedGroupValue = selectedGroup ? formatGroupLabel(selectedGroup) : draftProject?.projectGroup || ''
  const selectedClassValue = selectedClass ? formatClassLabel(selectedClass) : draftProject?.projectClass || ''
  const selectedNicCode = selectedNic ? formatNicCodeLabel(selectedNic) : draftProject?.projectNicCode || ''

  const applyProjectClassification = (patch) => {
    setDraftProject((current) => {
      const next = { ...current, ...patch }
      const section = splitCodeLabel(next.projectSection)
      const division = splitCodeLabel(next.projectDivision)
      const group = splitCodeLabel(next.projectGroup)
      const cls = splitCodeLabel(next.projectClass)
      const nic = splitCodeLabel(next.projectNicCode)
      return {
        ...next,
        sectionCode: section.code,
        sectionName: section.name,
        divisionCode: division.code,
        divisionName: division.name,
        groupCode: group.code,
        groupName: group.name,
        classCode: cls.code,
        className: cls.name,
        nicCode: nic.code,
        nicName: nic.name,
      }
    })
  }

  const saveEdits = (cardName) => {
    if (!canEditProject('Details cannot be changed')) {
      return
    }

    syncProject((currentProject) => {
      let changes = {}
      let actionText = ''

      if (cardName === 'projectInfo') {
        changes = {
          projectTitle: draftProject.projectTitle,
          projectSection: draftProject.projectSection,
          projectDivision: draftProject.projectDivision,
          projectGroup: draftProject.projectGroup,
          projectClass: draftProject.projectClass,
          projectNicCode: draftProject.projectNicCode,
          nicCode: draftProject.nicCode,
          sectionCode: draftProject.sectionCode,
          sectionName: draftProject.sectionName,
          divisionCode: draftProject.divisionCode,
          divisionName: draftProject.divisionName,
          groupCode: draftProject.groupCode,
          groupName: draftProject.groupName,
          classCode: draftProject.classCode,
          className: draftProject.className,
          nicName: draftProject.nicName,
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

  const applyStatusChange = (status) => {
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
      setEditingFieldId(null)
    }
  }

  const changeStatus = (status) => {
    if (status === project.status) {
      return
    }

    if (isProjectCompleted(project.status) && status !== project.status) {
      showLockedMessage('Status cannot be changed')
      return
    }

    if (isProjectCompleted(status)) {
      setPendingCompletion(true)
      return
    }

    applyStatusChange(status)
  }

  const confirmCompletion = () => {
    applyStatusChange('Project Completed')
    setPendingCompletion(false)
  }

  const addDocumentField = () => {
    if (!canEditProject('Documents cannot be changed')) {
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

  const attachFile = async (documentId, file) => {
    if (!canEditProject('Files cannot be changed')) return
    if (!file) return

    setUploadingDocId(documentId)
    setErrorMsg('')
    try {
      const uploaded = await uploadAdminFile(file, `startupcredit/projects/${project.id}`)
      // Friendly label preferred over Cloudinary's raw format string.
      uploaded.type = uploaded.type || getFileType(file.name)
      uploaded.size = uploaded.size || formatFileSize(file.size)
      uploaded.uploadedOn = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      syncProject((currentProject) => {
        const documentName =
          currentProject.documents.find((d) => d.id === documentId)?.fieldName || 'document'
        return {
          ...currentProject,
          documents: currentProject.documents.map((document) =>
            document.id === documentId ? { ...document, file: uploaded } : document
          ),
          lastUpdated: 'Today',
          history: [
            ...(currentProject.history || []),
            createHistoryEntry(`uploaded file "${file.name}" to "${documentName}"`),
          ],
        }
      })
    } catch (err) {
      setErrorMsg(err?.message || 'Could not upload file. Please try again.')
    } finally {
      setUploadingDocId(null)
    }
  }

  const removeFile = (documentId) => {
    if (!canEditProject('Files cannot be changed')) {
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

  const renameDocumentField = (documentId, newName) => {
    if (!canEditProject('Documents cannot be changed')) {
      return
    }

    const trimmed = newName.trim()
    if (!trimmed) return
    syncProject((currentProject) => {
      const doc = currentProject.documents.find(d => d.id === documentId)
      const oldName = doc?.fieldName
      if (!doc || oldName === trimmed) return currentProject

      return {
        ...currentProject,
        documents: currentProject.documents.map((document) =>
          document.id === documentId
            ? { ...document, fieldName: trimmed }
            : document
        ),
        lastUpdated: 'Today',
        history: [
          ...(currentProject.history || []),
          createHistoryEntry(`renamed document field from "${oldName}" to "${trimmed}"`),
        ],
      }
    })
  }

  const deleteDocumentField = (documentId) => {
    if (!canEditProject('Documents cannot be changed')) {
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
    if (!canEditProject('Notes cannot be changed')) {
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
      {errorMsg && (
        <div style={{ padding: '12px 18px', margin: '12px 0', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
          {errorMsg}
        </div>
      )}

      <article className="admin-users-card admin-workflow-card">
        <header className="admin-section-header">
          <h2>Project Workflow</h2>
          <span>{PROJECT_STATUSES.indexOf(project.status) + 1} of {PROJECT_STATUSES.length} stages completed</span>
        </header>
        <div className="admin-stepper">
          {PROJECT_STATUSES.map((status, index) => {
            const currentStatusIndex = PROJECT_STATUSES.indexOf(project.status)
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
                    disabled={isProjectCompleted(project.status)}
                    onClick={() => changeStatus(status)}
                    title={isProjectCompleted(project.status) ? 'Project workflow is locked' : `Update stage to: ${status}`}
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
              <button onClick={() => canEditProject('Details cannot be changed') && setEditingCard('projectInfo')} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.25rem' }} title="Edit Project Information">
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
              <span>Project Sector</span>
              {editingCard === 'projectInfo' ? (
                <select value={selectedSectionValue} onChange={(e) => applyProjectClassification({ projectSection: e.target.value, projectDivision: '', projectGroup: '', projectClass: '', projectNicCode: '' })} disabled={nicLoading} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <option value="">Select Project Section</option>
                  {nicDataFull.map((section) => (
                    <option key={section.code} value={formatSectionLabel(section)}>{formatSectionLabel(section)}</option>
                  ))}
                </select>
              ) : (
                <strong>{project.sectionName}</strong>
              )}
            </div>
            <div>
              <span>Project Division</span>
              {editingCard === 'projectInfo' ? (
                <select value={selectedDivisionValue} onChange={(e) => applyProjectClassification({ projectDivision: e.target.value, projectGroup: '', projectClass: '', projectNicCode: '' })} disabled={!selectedSection || nicLoading} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <option value="">Select Project Division</option>
                  {(selectedSection?.divisions || []).map((division) => (
                    <option key={division.code} value={formatDivisionLabel(division)}>{formatDivisionLabel(division)}</option>
                  ))}
                </select>
              ) : (
                <strong>{project.divisionName}</strong>
              )}
            </div>
            <div>
              <span>Project Group</span>
              {editingCard === 'projectInfo' ? (
                <select value={selectedGroupValue} onChange={(e) => applyProjectClassification({ projectGroup: e.target.value, projectClass: '', projectNicCode: '' })} disabled={!selectedDivision || nicLoading} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <option value="">Select Project Group</option>
                  {(selectedDivision?.groups || []).map((group) => (
                    <option key={group.code} value={formatGroupLabel(group)}>{formatGroupLabel(group)}</option>
                  ))}
                </select>
              ) : (
                <strong>{project.groupName}</strong>
              )}
            </div>
            <div>
              <span>Project Class</span>
              {editingCard === 'projectInfo' ? (
                <select value={selectedClassValue} onChange={(e) => applyProjectClassification({ projectClass: e.target.value, projectNicCode: '' })} disabled={!selectedGroup || nicLoading} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <option value="">Select Project Class</option>
                  {(selectedGroup?.classes || []).map((cls) => (
                    <option key={cls.code} value={formatClassLabel(cls)}>{formatClassLabel(cls)}</option>
                  ))}
                </select>
              ) : (
                <strong>{project.className}</strong>
              )}
            </div>
            <div>
              <span>NIC Code</span>
              {editingCard === 'projectInfo' ? (
                <select value={selectedNicCode} onChange={(e) => applyProjectClassification({ projectNicCode: e.target.value })} disabled={!selectedClass || nicLoading} style={{ padding: '0.2rem', width: '100%', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <option value="">Select Subclass (NIC Code)</option>
                  {(selectedClass?.sub_classes || []).map((sc) => (
                    <option key={sc.code} value={formatNicCodeLabel(sc)}>{formatNicCodeLabel(sc)}</option>
                  ))}
                </select>
              ) : (
                <strong>{project.nicCode} - {project.nicName}</strong>
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
              <button onClick={() => canEditProject('Details cannot be changed') && setEditingCard('clientInfo')} type="button" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.25rem' }} title="Edit Client Information">
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
                  <option value="Associate">Associate</option>
                </select>
              ) : (
                <strong>{project.submittedByType}</strong>
              )}
            </div>
            {((editingCard === 'clientInfo' && draftProject.submittedByType === 'Associate') || (editingCard !== 'clientInfo' && project.submittedByType === 'Associate')) && (
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
                  <label onClick={(event) => {
                    if (isProjectCompleted(project.status)) {
                      event.preventDefault()
                      showLockedMessage('Files cannot be changed')
                    }
                  }}>
                    <i className="fa-solid fa-upload" aria-hidden="true"></i>
                    {document.file ? 'Replace' : 'Upload'}
                    <input
                      accept={ACCEPTED_FILE_TYPES}
                      onChange={(event) => attachFile(document.id, event.target.files[0])}
                      disabled={isProjectCompleted(project.status) || uploadingDocId === document.id}
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
                      if (canEditProject('Documents cannot be changed')) {
                        setEditingFieldId(document.id)
                        setEditingFieldName(document.fieldName)
                      }
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

      {pendingCompletion && (
        <div className="admin-modal-backdrop" role="presentation">
          <section
            aria-labelledby="project-complete-confirm-title"
            aria-modal="true"
            className="admin-modal admin-confirm-modal"
            role="dialog"
          >
            <header className="admin-modal-header">
              <div>
                <p>Confirm Action</p>
                <h2 id="project-complete-confirm-title">Do you want to mark this project as complete?</h2>
              </div>
              <button
                aria-label="Close confirmation"
                onClick={() => setPendingCompletion(false)}
                type="button"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </header>
            <div className="admin-modal-body">
              <div className="admin-detail-block">
                <strong>{project.projectTitle}</strong>
                <p>
                  Once marked as completed, the project becomes locked. Its status, details,
                  description, files, notes, and other fields can no longer be edited or updated.
                  This action cannot be reversed.
                </p>
              </div>
              <div className="admin-modal-actions">
                <button
                  className="admin-link-button secondary"
                  onClick={() => setPendingCompletion(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="admin-link-button"
                  onClick={confirmCompletion}
                  type="button"
                >
                  Continue
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

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

      <DocumentPreviewModal
        open={Boolean(previewDoc)}
        file={previewDoc?.file}
        title={previewDoc?.title}
        onClose={() => setPreviewDoc(null)}
      />
    </AdminShell>
  )
}

export default AdminProjectDetail
