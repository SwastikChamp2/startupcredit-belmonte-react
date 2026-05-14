import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import RequireAuth from '../components/RequireAuth'
import SubmissionModal from '../components/SubmissionModal'
import { submitProjectInquiry } from '../services/formsApi'
import { fetchNicData } from '../services/staticDataApi'
import { useAuth } from '../hooks/useAuth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

const formatSectionLabel = (s) => `Section ${s.code} - ${s.name}`
const formatDivisionLabel = (d) => `Division ${d.code} - ${d.name}`
const formatGroupLabel = (g) => `Group ${g.code} - ${g.name}`
const formatClassLabel = (c) => `Class ${c.code} - ${c.name}`
const formatNicCodeLabel = (sc) => `NIC ${sc.code} - ${sc.name}`
const ASSOCIATE_SUBMISSION_TYPE = 'Associate'

const getAssociateName = (associate) =>
  [associate?.firstName, associate?.middleName, associate?.lastName].filter(Boolean).join(' ')

function SelectProject() {
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')
  const [sectionIdx, setSectionIdx] = useState('')
  const [divisionIdx, setDivisionIdx] = useState('')
  const [groupIdx, setGroupIdx] = useState('')
  const [classIdx, setClassIdx] = useState('')
  const [nicCodeIdx, setNicCodeIdx] = useState('')
  const [nicDataFull, setNicDataFull] = useState([])
  const [nicLoading, setNicLoading] = useState(true)
  const [nicError, setNicError] = useState('')
  
  const { user } = useAuth()
  const [isAssociate, setIsAssociate] = useState(false)
  const [associateData, setAssociateData] = useState(null)
  const [submissionType, setSubmissionType] = useState('Self') // 'Self' or 'Associate'
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchNicData()
      .then((data) => {
        if (cancelled) return
        setNicDataFull(data.nicDataFull)
      })
      .catch((err) => {
        if (!cancelled) setNicError(err?.message || 'Could not load NIC data.')
      })
      .finally(() => {
        if (!cancelled) setNicLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadAssociateStatus = async () => {
      if (!user?.email) {
        setIsAssociate(false)
        setAssociateData(null)
        setSubmissionType('Self')
        return
      }

      if (user?.role === 'Associate') {
        if (cancelled) return
        setIsAssociate(true)
        setAssociateData({
          name: user.name || user.email.split('@')[0],
          email: user.email || ''
        })
        return
      }

      try {
        const associateQuery = query(
          collection(db, 'businessAssociateApplications'),
          where('email', '==', user.email.toLowerCase())
        )
        const snap = await getDocs(associateQuery)
        if (cancelled) return
        const verifiedAssociate = snap.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .find((associate) => associate.status === 'Verified')

        if (verifiedAssociate) {
          setIsAssociate(true)
          setAssociateData({
            name: getAssociateName(verifiedAssociate) || user.name || user.email.split('@')[0],
            email: verifiedAssociate.email || user.email || ''
          })
        } else {
          setIsAssociate(false)
          setAssociateData(null)
          setSubmissionType('Self')
        }
      } catch (err) {
        console.warn('Could not verify business associate status:', err)
        if (cancelled) return
        setIsAssociate(false)
        setAssociateData(null)
        setSubmissionType('Self')
      }
    }

    loadAssociateStatus()

    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (!isAssociate && submissionType === ASSOCIATE_SUBMISSION_TYPE) {
      setSubmissionType('Self')
    }
  }, [isAssociate, submissionType])

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 2500)
  }

  const handleDisabledClick = (fieldName, dependsOn) => () => {
    showToast(`Please select ${dependsOn} first to enable ${fieldName}`)
  }

  const divisions =
    sectionIdx !== '' && nicDataFull[sectionIdx] ? nicDataFull[sectionIdx].divisions || [] : []
  const groups = divisionIdx !== '' && divisions[divisionIdx] ? divisions[divisionIdx].groups || [] : []
  const classes = groupIdx !== '' && groups[groupIdx] ? groups[groupIdx].classes || [] : []
  const nicCodes = classIdx !== '' && classes[classIdx] ? classes[classIdx].sub_classes || [] : []

  const handleSectionChange = (e) => {
    setSectionIdx(e.target.value)
    setDivisionIdx('')
    setGroupIdx('')
    setClassIdx('')
    setNicCodeIdx('')
  }

  const handleDivisionChange = (e) => {
    setDivisionIdx(e.target.value)
    setGroupIdx('')
    setClassIdx('')
    setNicCodeIdx('')
  }

  const handleGroupChange = (e) => {
    setGroupIdx(e.target.value)
    setClassIdx('')
    setNicCodeIdx('')
  }

  const handleClassChange = (e) => {
    setClassIdx(e.target.value)
    setNicCodeIdx('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const form = e.target
    const fd = new FormData(form)
    const section = sectionIdx !== '' ? nicDataFull[sectionIdx] : null
    const division = section && divisionIdx !== '' ? section.divisions[divisionIdx] : null
    const group = division && groupIdx !== '' ? division.groups[groupIdx] : null
    const cls = group && classIdx !== '' ? group.classes[classIdx] : null
    const sub = cls && nicCodeIdx !== '' ? cls.sub_classes[nicCodeIdx] : null

    const payload = {
      projectTitle: fd.get('projectTitle')?.toString().trim() || '',
      projectDescription: fd.get('projectDescription')?.toString().trim() || '',
      projectSection: section ? `${section.code} - ${section.name}` : '',
      projectDivision: division ? `${division.code} - ${division.name}` : '',
      projectGroup: group ? `${group.code} - ${group.name}` : '',
      projectClass: cls ? `${cls.code} - ${cls.name}` : '',
      nicCode: sub ? `${sub.code} - ${sub.name}` : '',
      submittedByType: submissionType,
      clientName: submissionType === ASSOCIATE_SUBMISSION_TYPE ? clientName : '',
      clientPhone: submissionType === ASSOCIATE_SUBMISSION_TYPE ? clientPhone : '',
      associateName: submissionType === ASSOCIATE_SUBMISSION_TYPE ? associateData?.name : '',
      associateEmail: submissionType === ASSOCIATE_SUBMISSION_TYPE ? associateData?.email : '',
    }

    setSubmitting(true)
    try {
      await submitProjectInquiry(payload)
      setShowModal(true)
      form.reset()
      setSectionIdx('')
      setDivisionIdx('')
      setGroupIdx('')
      setClassIdx('')
      setNicCodeIdx('')
      setClientName('')
      setClientPhone('')
      setSubmissionType('Self')
    } catch (err) {
      setErrorMsg(err?.message || 'Could not submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Select Project" breadcrumb="Select Project" />

      {toast && (
        <div style={{
          position: 'fixed',
          top: '110px',
          right: '30px',
          zIndex: 9999,
          padding: '14px 22px',
          background: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba',
          borderRadius: '8px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          fontSize: '14px',
          fontWeight: 600,
          maxWidth: '360px',
          animation: 'slideInRight 0.3s ease'
        }}>
          <i className="fas fa-exclamation-circle" style={{ marginRight: 10, color: '#f0ad4e' }} />
          {toast}
        </div>
      )}

      <RequireAuth
        title="Login to submit your project"
        message="Please log in or create an account to submit project details. Your submission will be linked to your account so we can follow up with you."
      >
      <section className="contact-section pt-130 pb-130">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="blog-contact-form">
                <h2 className="title mb-0">Project Information</h2>
                <p className="mb-30 mt-10">Fill in the details about your project to help us find the right funding for you</p>
                <div className="request-form">
                  <SubmissionModal 
                    isOpen={showModal} 
                    onClose={() => setShowModal(false)}
                    title="Submission Received!"
                    message="Your project inquiry has been submitted successfully. Our specialists will analyze your requirements and get back to you with potential funding schemes."
                  />
                  {errorMsg && <div className="alert alert-danger mb-3">{errorMsg}</div>}
                  {nicError && <div className="alert alert-danger mb-3">{nicError}</div>}
                  {nicLoading && !nicError && (
                    <div className="alert alert-info mb-3">Loading NIC data…</div>
                  )}

                  {isAssociate && (
                    <div className="submission-type-toggle mb-4">
                      <label className="d-block mb-2 font-weight-bold" style={{ fontSize: '15px', color: '#444' }}>Submission Mode</label>
                      <div className="btn-group w-100" role="group" aria-label="Submission Type">
                        <button
                          type="button"
                          className={`btn ${submissionType === 'Self' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setSubmissionType('Self')}
                          style={{ flex: 1, padding: '10px', fontSize: '14px' }}
                        >
                          <i className="fas fa-user-circle mr-2"></i> Submitting project for self
                        </button>
                        <button
                          type="button"
                          className={`btn ${submissionType === ASSOCIATE_SUBMISSION_TYPE ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setSubmissionType(ASSOCIATE_SUBMISSION_TYPE)}
                          style={{ flex: 1, padding: '10px', fontSize: '14px' }}
                        >
                          <i className="fas fa-users-cog mr-2"></i> Submitting project for a client
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="form-horizontal">
                    {submissionType === ASSOCIATE_SUBMISSION_TYPE && (
                      <div className="associate-fields-container mb-4" style={{ 
                        background: '#f8fafc', 
                        padding: '20px', 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
                      }}>
                        <h4 style={{ fontSize: '16px', marginBottom: '15px', color: '#1e293b' }}>Client & Associate Details</h4>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <div className="form-item">
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Client Name" 
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                required 
                              />
                              <div className="icon"><i className="fas fa-user" /></div>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="form-item">
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Client Number" 
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                required 
                              />
                              <div className="icon"><i className="fas fa-phone" /></div>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <div className="form-item">
                              <input 
                                type="text" 
                                className="form-control" 
                                value={associateData?.name || ''} 
                                readOnly 
                                style={{ background: '#edf2f7', cursor: 'not-allowed' }}
                                placeholder="Associate Name"
                              />
                              <div className="icon"><i className="fas fa-id-badge" /></div>
                            </div>
                            <small className="text-muted">Associate Name (Auto-filled)</small>
                          </div>
                          <div className="col-md-6 mb-3">
                            <div className="form-item">
                              <input 
                                type="email" 
                                className="form-control" 
                                value={associateData?.email || ''} 
                                readOnly 
                                style={{ background: '#edf2f7', cursor: 'not-allowed' }}
                                placeholder="Associate Email"
                              />
                              <div className="icon"><i className="fas fa-envelope" /></div>
                            </div>
                            <small className="text-muted">Associate Email (Auto-filled)</small>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="form-group row">
                      <div className="col-md-12">
                        <div className="form-item">
                          <input type="text" name="projectTitle" className="form-control" placeholder="Project Title" required />
                          <div className="icon"><i className="fas fa-project-diagram" /></div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-md-12">
                        <div className="form-item">
                          <select
                            name="projectSection"
                            className="form-control"
                            value={sectionIdx}
                            onChange={handleSectionChange}
                            required
                          >
                            <option value="">Select Project Section</option>
                            {nicDataFull.map((section, idx) => (
                              <option key={section.code} value={idx}>{formatSectionLabel(section)}</option>
                            ))}
                          </select>
                          <div className="icon"><i className="fas fa-layer-group" /></div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-md-12">
                        <div
                          className="form-item"
                          onClick={sectionIdx === '' ? handleDisabledClick('Division', 'Section') : undefined}
                        >
                          <select
                            name="projectDivision"
                            className={`form-control${sectionIdx === '' ? ' is-disabled' : ''}`}
                            value={divisionIdx}
                            onChange={handleDivisionChange}
                            disabled={sectionIdx === ''}
                            required
                          >
                            <option value="">Select Project Division</option>
                            {divisions.map((division, idx) => (
                              <option key={division.code} value={idx}>{formatDivisionLabel(division)}</option>
                            ))}
                          </select>
                          <div className="icon"><i className="fas fa-sitemap" /></div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-md-12">
                        <div
                          className="form-item"
                          onClick={divisionIdx === '' ? handleDisabledClick('Group', 'Division') : undefined}
                        >
                          <select
                            name="projectGroup"
                            className={`form-control${divisionIdx === '' ? ' is-disabled' : ''}`}
                            value={groupIdx}
                            onChange={handleGroupChange}
                            disabled={divisionIdx === ''}
                            required
                          >
                            <option value="">Select Project Group</option>
                            {groups.map((group, idx) => (
                              <option key={group.code} value={idx}>{formatGroupLabel(group)}</option>
                            ))}
                          </select>
                          <div className="icon"><i className="fas fa-tags" /></div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-md-12">
                        <div
                          className="form-item"
                          onClick={groupIdx === '' ? handleDisabledClick('Class', 'Group') : undefined}
                        >
                          <select
                            name="projectClass"
                            className={`form-control${groupIdx === '' ? ' is-disabled' : ''}`}
                            value={classIdx}
                            onChange={handleClassChange}
                            disabled={groupIdx === ''}
                            required
                          >
                            <option value="">Select Project Class</option>
                            {classes.map((cls, idx) => (
                              <option key={cls.code} value={idx}>{formatClassLabel(cls)}</option>
                            ))}
                          </select>
                          <div className="icon"><i className="fas fa-th-large" /></div>
                        </div>
                      </div>
                    </div>
                    {/* <div className="form-group row">
                      <div className="col-md-12">
                        <div className="form-item" ref={searchRef} style={{ position: 'relative' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search NIC Code (e.g. 01111 or wheat)"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                          />
                          <div className="icon"><i className="fas fa-search" /></div>
                          {showSuggestions && searchResults.length > 0 && (
                            <ul style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              zIndex: 1000,
                              background: '#fff',
                              border: '1px solid #ddd',
                              borderTop: 'none',
                              borderRadius: '0 0 6px 6px',
                              maxHeight: '250px',
                              overflowY: 'auto',
                              listStyle: 'none',
                              margin: 0,
                              padding: 0,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                              {searchResults.map(item => (
                                <li
                                  key={item.sub_class_code}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => handleSearchSelect(item)}
                                  style={{
                                    padding: '10px 15px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f0f0f0',
                                    fontSize: '14px'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                >
                                  <strong>{item.sub_class_code}</strong> - {item.sub_class_name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-md-12">
                        <div className="form-item">
                          <select
                            name="nicCode"
                            className="form-control"
                            value={nicCodeIdx}
                            onChange={(e) => setNicCodeIdx(e.target.value)}
                            disabled={classIdx === ''}
                            required
                          >
                            <option value="">Select NIC Code</option>
                            {nicCodes.map((sc, idx) => (
                              <option key={sc.code} value={idx}>{formatNicCodeLabel(sc)}</option>
                            ))}
                          </select>
                          <div className="icon"><i className="fas fa-barcode" /></div>
                        </div>
                      </div>
                    </div> */}
                    <div className="form-group row">
                      <div className="col-md-12">
                        <div
                          className="form-item"
                          onClick={classIdx === '' ? handleDisabledClick('Subclass (NIC Code)', 'Class') : undefined}
                        >
                          <select
                            name="nicCode"
                            className={`form-control${classIdx === '' ? ' is-disabled' : ''}`}
                            value={nicCodeIdx}
                            onChange={(e) => setNicCodeIdx(e.target.value)}
                            disabled={classIdx === ''}
                          >
                            <option value="">Select Subclass (NIC Code)</option>
                            {nicCodes.map((sc, idx) => (
                              <option key={sc.code} value={idx}>{formatNicCodeLabel(sc)}</option>
                            ))}
                          </select>
                          <div className="icon"><i className="fas fa-barcode" /></div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-md-12">
                        <div className="form-item message-item">
                          <textarea name="projectDescription" cols={30} rows={5} className="form-control address" placeholder="Project Description" required />
                          <div className="icon"><i className="fas fa-file-alt" /></div>
                        </div>
                      </div>
                    </div>
                    <div className="submit-btn">
                      <button
                        className="bz-primary-btn"
                        type="submit"
                        disabled={submitting || nicLoading}
                      >
                        {submitting ? 'SUBMITTING...' : 'SUBMIT PROJECT'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </RequireAuth>
    </>
  )
}

export default SelectProject
