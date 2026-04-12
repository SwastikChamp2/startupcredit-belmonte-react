import { useState, useRef, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import { nicDataFull, allNicCodes } from '../data/nicDataFull'

const formatSectionLabel = (s) => `Section ${s.code} - ${s.name}`
const formatDivisionLabel = (d) => `Division ${d.code} - ${d.name}`
const formatGroupLabel = (g) => `Group ${g.code} - ${g.name}`
const formatClassLabel = (c) => `Class ${c.code} - ${c.name}`
const formatNicCodeLabel = (sc) => `NIC ${sc.code} - ${sc.name}`

function SelectProject() {
  const [msg, setMsg] = useState('')
  const [sectionIdx, setSectionIdx] = useState('')
  const [divisionIdx, setDivisionIdx] = useState('')
  const [groupIdx, setGroupIdx] = useState('')
  const [classIdx, setClassIdx] = useState('')
  const [nicCodeIdx, setNicCodeIdx] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)
  const isSelectingRef = useRef(false)

  // Close suggestions when clicking outside the search container
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const divisions = sectionIdx !== '' ? nicDataFull[sectionIdx].divisions : []
  const groups = divisionIdx !== '' ? divisions[divisionIdx].groups : []
  const classes = groupIdx !== '' ? groups[groupIdx].classes : []
  const nicCodes = classIdx !== '' ? classes[classIdx].sub_classes : []

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

  const searchResults = searchTerm.length >= 2
    ? allNicCodes.filter(item =>
        item.sub_class_code.startsWith(searchTerm) ||
        item.sub_class_name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 20)
    : []

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setShowSuggestions(e.target.value.length >= 2)
  }

  const handleSearchSelect = (item) => {
    setSectionIdx(String(item.sectionIdx))
    setDivisionIdx(String(item.divisionIdx))
    setGroupIdx(String(item.groupIdx))
    setClassIdx(String(item.classIdx))
    const subs = nicDataFull[item.sectionIdx].divisions[item.divisionIdx]
      .groups[item.groupIdx].classes[item.classIdx].sub_classes
    const nicIdx = subs.findIndex(sc => sc.code === item.sub_class_code)
    setNicCodeIdx(String(nicIdx))
    setSearchTerm('')
    setShowSuggestions(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setMsg('Your project details have been submitted successfully!')
    e.target.reset()
    setSectionIdx('')
    setDivisionIdx('')
    setGroupIdx('')
    setClassIdx('')
    setNicCodeIdx('')
    setSearchTerm('')
    setShowSuggestions(false)
    setTimeout(() => setMsg(''), 5000)
  }

  return (
    <>
      <PageHeader title="Select Project" breadcrumb="Select Project" />

      <section className="contact-section pt-130 pb-130">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="blog-contact-form">
                <h2 className="title mb-0">Project Information</h2>
                <p className="mb-30 mt-10">Fill in the details about your project to help us find the right funding for you</p>
                <div className="request-form">
                  {msg && <div className="alert alert-success mb-3">{msg}</div>}
                  <form onSubmit={handleSubmit} className="form-horizontal">
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
                        <div className="form-item">
                          <select
                            name="projectDivision"
                            className="form-control"
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
                        <div className="form-item">
                          <select
                            name="projectGroup"
                            className="form-control"
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
                        <div className="form-item">
                          <select
                            name="projectClass"
                            className="form-control"
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
                    <div className="form-group row">
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
                      <button className="bz-primary-btn" type="submit">SUBMIT PROJECT</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default SelectProject
