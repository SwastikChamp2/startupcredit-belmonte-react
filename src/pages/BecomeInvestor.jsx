import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import FileUploadBox from '../components/FileUploadBox'

const aadhaarValidationProps = {
  inputMode: 'numeric',
  pattern: '[0-9]{12}',
  maxLength: 12,
  title: 'Please enter a 12-digit Aadhaar number',
  onInput: (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 12)
  },
  onInvalid: (e) => {
    if (e.target.value.length > 0) {
      e.target.setCustomValidity('Please enter a valid 12-digit Aadhaar number')
    }
  },
  onChange: (e) => {
    e.target.setCustomValidity('')
  },
}

const panValidationProps = {
  inputMode: 'text',
  pattern: '[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}',
  maxLength: 10,
  title: 'Please enter a valid 10-character PAN number',
  onInput: (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
  },
  onInvalid: (e) => {
    if (e.target.value.length > 0) {
      e.target.setCustomValidity('Please enter a valid PAN number in 10-character format')
    }
  },
  onChange: (e) => {
    e.target.setCustomValidity('')
  },
}

function BecomeInvestor() {
  const [msg, setMsg] = useState('')
  const [investorType, setInvestorType] = useState('individual')
  const [aadhaarFile, setAadhaarFile] = useState(null)
  const [panFile, setPanFile] = useState(null)

  const isOrg = investorType === 'organisation'

  const handleSubmit = (e) => {
    e.preventDefault()
    setMsg('Your investor application has been submitted successfully! Our team will contact you shortly.')
    e.target.reset()
    setInvestorType('individual')
    setAadhaarFile(null)
    setPanFile(null)
    setTimeout(() => setMsg(''), 5000)
  }

  const radioBoxStyle = (active) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    borderRadius: '10px',
    border: active ? '2px solid #1E6EE7' : '2px solid #e0e0e0',
    background: active ? '#f0f5ff' : '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  })

  const radioDotOuter = (active) => ({
    width: '22px',
    height: '22px',
    minWidth: '22px',
    borderRadius: '50%',
    border: active ? '2px solid #1E6EE7' : '2px solid #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  })

  const radioDotInner = (active) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: active ? '#1E6EE7' : 'transparent',
    transition: 'all 0.3s ease',
  })

  return (
    <>
      <PageHeader title="Become an Investor" breadcrumb="Become an Investor" />

      {/* CTA Banner Section */}
      <section className="about-cta fade-wrapper">
        <div className="container">
          <div className="about-cta-wrap pt-120 pb-120 text-center fade-top">
            <div className="bg-item">
              <div className="bg-img" data-background="assets/img/bg-img/about-cta-bg.jpg" />
              <div className="overlay" />
              <div className="overlay-2" />
              <div className="shape"><img src="assets/img/shapes/about-cta-shape.png" alt="shape" /></div>
            </div>
            <div className="section-heading white-content mb-40">
              <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />INVEST WITH US</h4>
              <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Become Our Investor</h2>
            </div>
            <p className="text-white mb-0" style={{ fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
              Join StartupCredit as an investor and get access to a curated pipeline of high-potential
              startups and MSMEs ready for funding. Grow your portfolio with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="service-process pt-120 pb-120">
        <div className="container">
          <div className="section-heading text-center">
            <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />WHY INVEST WITH US</h4>
            <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Benefits of Becoming Our Investor</h2>
          </div>
          <div className="row gy-lg-0 gy-4 fade-wrapper">
            <div className="col-lg-4 col-md-6 fade-top">
              <div className="service-process-card">
                <span className="number">01</span>
                <h3 className="title">Curated Deal Flow</h3>
                <p>Access a pre-vetted pipeline of startups and MSMEs across diverse sectors, carefully screened by our expert team for viability and growth potential.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 fade-top">
              <div className="service-process-card">
                <span className="number">02</span>
                <h3 className="title">High Returns</h3>
                <p>Invest in high-growth businesses at early stages and benefit from attractive returns as they scale with the right capital and guidance.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 fade-top">
              <div className="service-process-card">
                <span className="number">03</span>
                <h3 className="title">Portfolio Diversification</h3>
                <p>Spread your investments across multiple industries, stages, and funding instruments to build a balanced and resilient portfolio.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 fade-top mt-lg-4">
              <div className="service-process-card">
                <span className="number">04</span>
                <h3 className="title">Complete Transparency</h3>
                <p>Get detailed project reports, financial projections, and regular updates on your investments with full visibility into fund utilization.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 fade-top mt-lg-4">
              <div className="service-process-card">
                <span className="number">05</span>
                <h3 className="title">End-to-End Support</h3>
                <p>From due diligence to documentation and post-investment monitoring, our team handles everything so you can invest with peace of mind.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 fade-top mt-lg-4">
              <div className="service-process-card">
                <span className="number">06</span>
                <h3 className="title">Exclusive Network</h3>
                <p>Join an elite circle of investors, angel syndicates, and financial institutions collaborating to fuel the next wave of Indian entrepreneurship.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investor Registration Form */}
      <section className="contact-section pt-130 pb-130" style={{ backgroundColor: '#F6F7FA' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="blog-contact-form">
                <div className="section-heading mb-30">
                  <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />REGISTER AS INVESTOR</h4>
                  <h2 className="section-title mb-0">Investor Information</h2>
                </div>
                <p className="mb-30">Fill in your details below. Fields marked with * are required.</p>
                <div className="request-form">
                  {msg && <div className="alert alert-success mb-3">{msg}</div>}
                  <form onSubmit={handleSubmit} className="form-horizontal">

                    {/* Nature of Investor - Radio Buttons */}
                    <div className="form-group row">
                      <div className="col-md-12">
                        <label style={{ fontSize: '15px', fontWeight: 600, color: '#191F29', marginBottom: '12px', display: 'block' }}>
                          Nature of Investor *
                        </label>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '25px', flexWrap: 'wrap' }}>
                          <label style={radioBoxStyle(investorType === 'individual')} onClick={() => setInvestorType('individual')}>
                            <div style={radioDotOuter(investorType === 'individual')}>
                              <div style={radioDotInner(investorType === 'individual')} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '15px', color: '#191F29' }}>Individual</div>
                              <div style={{ fontSize: '13px', color: '#74787C', marginTop: '2px' }}>Invest as a personal entity</div>
                            </div>
                          </label>
                          <label style={radioBoxStyle(investorType === 'organisation')} onClick={() => setInvestorType('organisation')}>
                            <div style={radioDotOuter(investorType === 'organisation')}>
                              <div style={radioDotInner(investorType === 'organisation')} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '15px', color: '#191F29' }}>Organisation</div>
                              <div style={{ fontSize: '13px', color: '#74787C', marginTop: '2px' }}>Invest as a company or firm</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Name of Investor */}
                    <div className="form-group row">
                      <div className="col-md-12">
                        <div className="form-item">
                          <input type="text" name="investorName" className="form-control" placeholder={isOrg ? 'Organisation Name *' : 'Full Name *'} required />
                          <div className="icon"><i className={isOrg ? 'fas fa-building' : 'fas fa-user'} /></div>
                        </div>
                      </div>
                    </div>

                    {/* Type of Entity - Only for Organisation */}
                    {isOrg && (
                      <div className="form-group row">
                        <div className="col-md-12">
                          <div className="form-item">
                            <select name="entityType" className="form-control" required>
                              <option value="">Type of Entity *</option>
                              <option value="Sole Proprietorship">Sole Proprietorship</option>
                              <option value="Partnership">Partnership</option>
                              <option value="LLP">LLP</option>
                              <option value="Private Limited">Private Limited</option>
                              <option value="Public Limited">Public Limited</option>
                              <option value="Bank">Bank</option>
                              <option value="NBFC">NBFC</option>
                              <option value="AIF">AIF</option>
                              <option value="Angel Syndicate">Angel Syndicate</option>
                              <option value="VC Firm">VC Firm</option>
                            </select>
                            <div className="icon"><i className="fas fa-sitemap" /></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Average Check Size */}
                    <div className="form-group row">
                      <div className="col-md-12">
                        <div className="form-item">
                          <select name="checkSize" className="form-control" required>
                            <option value="">Average Check Size *</option>
                            <option value="Less than 1 Lakh">Less than 1 Lakh</option>
                            <option value="1 - 10 Lakhs">1 - 10 Lakhs</option>
                            <option value="10 - 50 Lakhs">10 - 50 Lakhs</option>
                            <option value="50 Lakhs - 1 Crore">50 Lakhs - 1 Crore</option>
                            <option value="1 - 5 Crores">1 - 5 Crores</option>
                            <option value="5 - 10 Crores">5 - 10 Crores</option>
                            <option value="10 - 25 Crores">10 - 25 Crores</option>
                            <option value="25 - 50 Crores">25 - 50 Crores</option>
                            <option value="50 - 100 Crores">50 - 100 Crores</option>
                            <option value="100 Crores+">100 Crores+</option>
                          </select>
                          <div className="icon"><i className="fas fa-rupee-sign" /></div>
                        </div>
                      </div>
                    </div>

                    {/* Aadhaar & PAN - Only for Individual */}
                    {!isOrg && (
                      <>
                        <div className="form-group row">
                          <div className="col-md-6">
                            <div className="form-item">
                              <input type="text" name="aadhaarNumber" className="form-control" placeholder="Aadhaar Card No (Optional)" {...aadhaarValidationProps} />
                              <div className="icon"><i className="fas fa-id-card" /></div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <FileUploadBox
                              name="aadhaarUpload"
                              label="Upload Aadhaar Card"
                              file={aadhaarFile}
                              onFileChange={(f) => setAadhaarFile(f)}
                            />
                          </div>
                        </div>

                        <div className="form-group row">
                          <div className="col-md-6">
                            <div className="form-item">
                              <input type="text" name="panNumber" className="form-control" placeholder="PAN Card No (Optional)" {...panValidationProps} />
                              <div className="icon"><i className="fas fa-id-badge" /></div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <FileUploadBox
                              name="panUpload"
                              label="Upload PAN Card"
                              file={panFile}
                              onFileChange={(f) => setPanFile(f)}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="submit-btn">
                      <button className="bz-primary-btn" type="submit">SUBMIT APPLICATION</button>
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

export default BecomeInvestor
