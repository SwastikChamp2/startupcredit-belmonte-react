import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { nicData } from '../data/nicData'

const formatSectionLabel = (section) => `Section ${section.section_code} - ${section.section_name}`

const formatDivisionLabel = (division) => `Division ${division.division_code} - ${division.division_name}`

const formatGroupLabel = (group) => `Group ${group.group_code} - ${group.group_name}`

function SelectProject() {
  const [msg, setMsg] = useState('')
  const [sectionIdx, setSectionIdx] = useState('')
  const [divisionIdx, setDivisionIdx] = useState('')
  const [groupIdx, setGroupIdx] = useState('')

  const divisions = sectionIdx !== '' ? nicData[sectionIdx].divisions : []
  const groups = divisionIdx !== '' ? divisions[divisionIdx].groups : []

  const handleSectionChange = (e) => {
    setSectionIdx(e.target.value)
    setDivisionIdx('')
    setGroupIdx('')
  }

  const handleDivisionChange = (e) => {
    setDivisionIdx(e.target.value)
    setGroupIdx('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setMsg('Your project details have been submitted successfully!')
    e.target.reset()
    setSectionIdx('')
    setDivisionIdx('')
    setGroupIdx('')
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
                            {nicData.map((section, idx) => (
                              <option key={section.section_code} value={idx}>{formatSectionLabel(section)}</option>
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
                              <option key={division.division_code} value={idx}>{formatDivisionLabel(division)}</option>
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
                            onChange={(e) => setGroupIdx(e.target.value)}
                            disabled={divisionIdx === ''}
                            required
                          >
                            <option value="">Select Project Group</option>
                            {groups.map((group, idx) => (
                              <option key={group.group_code} value={idx}>{formatGroupLabel(group)}</option>
                            ))}
                          </select>
                          <div className="icon"><i className="fas fa-tags" /></div>
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
