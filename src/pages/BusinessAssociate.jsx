import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import FileUploadBox from '../components/FileUploadBox'

function BusinessAssociate() {
  const [msg, setMsg] = useState('')
  const [aadhaarFile, setAadhaarFile] = useState(null)
  const [panFile, setPanFile] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setMsg('Your application has been submitted successfully! We will get back to you soon.')
    e.target.reset()
    setAadhaarFile(null)
    setPanFile(null)
    setTimeout(() => setMsg(''), 5000)
  }

  return (
    <>
      <PageHeader title="Business Associate" breadcrumb="Business Associate" />

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
              <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />JOIN OUR NETWORK</h4>
              <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Become Our Business Associate</h2>
            </div>
            <p className="text-white mb-0" style={{ fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
              Partner with StartupCredit and help entrepreneurs access the right funding.
              Earn attractive commissions while building a rewarding career in startup finance.
            </p>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="service-process pt-120 pb-120">
        <div className="container">
          <div className="section-heading text-center">
            <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />WHY JOIN US</h4>
            <h2 className="section-title mb-0" data-text-animation data-split="word" data-duration={1}>Advantages of Becoming a Business Associate</h2>
          </div>
          <div className="row gy-lg-0 gy-4 fade-wrapper">
            <div className="col-lg-4 col-md-6 fade-top">
              <div className="service-process-card">
                <span className="number">01</span>
                <h3 className="title">Attractive Commission</h3>
                <p>Earn industry-leading commissions on every successful deal closure. The more you close, the more you earn with no cap on your income.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 fade-top">
              <div className="service-process-card">
                <span className="number">02</span>
                <h3 className="title">Flexible Work</h3>
                <p>Work on your own schedule and from anywhere. Enjoy the freedom of being your own boss while having the backing of a strong brand.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 fade-top">
              <div className="service-process-card">
                <span className="number">03</span>
                <h3 className="title">High Earnings</h3>
                <p>With multiple funding schemes and high-value deals, your earning potential is limitless. Top associates earn significantly every month.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 fade-top mt-lg-4">
              <div className="service-process-card">
                <span className="number">04</span>
                <h3 className="title">Premium Investor Access</h3>
                <p>Get direct access to premium investors, banks, and financial institutions to help your clients secure the best funding options.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 fade-top mt-lg-4">
              <div className="service-process-card">
                <span className="number">05</span>
                <h3 className="title">Better Deal Closure</h3>
                <p>Our expert team supports you with documentation, compliance, and processing, helping you close deals faster and more efficiently.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 fade-top mt-lg-4">
              <div className="service-process-card">
                <span className="number">06</span>
                <h3 className="title">Training &amp; Support</h3>
                <p>Receive comprehensive training on funding schemes, sales techniques, and client management to accelerate your success from day one.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="contact-section pt-130 pb-130" style={{ backgroundColor: '#F6F7FA' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="blog-contact-form">
                <div className="section-heading mb-30">
                  <h4 className="sub-heading" data-text-animation="fade-in" data-duration="1.5"><span className="left-shape" />REGISTER NOW</h4>
                  <h2 className="section-title mb-0">Fill in Your Details</h2>
                </div>
                <p className="mb-30">Complete the form below to apply as a Business Associate. All fields are required unless marked optional.</p>
                <div className="request-form">
                  {msg && <div className="alert alert-success mb-3">{msg}</div>}
                  <form onSubmit={handleSubmit} className="form-horizontal">

                    {/* Row 1: Name Fields */}
                    <div className="form-group row">
                      <div className="col-md-4">
                        <div className="form-item">
                          <input type="text" name="firstName" className="form-control" placeholder="First Name *" required />
                          <div className="icon"><i className="fas fa-user" /></div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-item">
                          <input type="text" name="middleName" className="form-control" placeholder="Middle Name (Optional)" />
                          <div className="icon"><i className="fas fa-user" /></div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-item">
                          <input type="text" name="lastName" className="form-control" placeholder="Last Name *" required />
                          <div className="icon"><i className="fas fa-user" /></div>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Email & Mobile */}
                    <div className="form-group row">
                      <div className="col-md-6">
                        <div className="form-item">
                          <input type="email" name="email" className="form-control" placeholder="Email Address *" required />
                          <div className="icon"><i className="fas fa-envelope" /></div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-item">
                          <input type="tel" name="mobile" className="form-control" placeholder="Mobile Number *" required />
                          <div className="icon"><i className="fas fa-phone" /></div>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Profession & DOB */}
                    <div className="form-group row">
                      <div className="col-md-6">
                        <div className="form-item">
                          <input type="text" name="profession" className="form-control" placeholder="Current Profession *" required />
                          <div className="icon"><i className="fas fa-briefcase" /></div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-item">
                          <input type="date" name="dob" className="form-control" placeholder="Date of Birth *" required />
                          <div className="icon"><i className="fas fa-calendar-alt" /></div>
                        </div>
                      </div>
                    </div>

                    {/* Row 4: Educational Status */}
                    <div className="form-group row">
                      <div className="col-md-12">
                        <div className="form-item">
                          <select name="educationalStatus" className="form-control" required>
                            <option value="">Educational Status *</option>
                            <option value="10th Pass">10th Pass</option>
                            <option value="12th Pass">12th Pass</option>
                            <option value="Diploma">Diploma</option>
                            <option value="Graduate">Graduate</option>
                            <option value="Post Graduate">Post Graduate</option>
                            <option value="Doctorate">Doctorate</option>
                            <option value="Other">Other</option>
                          </select>
                          <div className="icon"><i className="fas fa-graduation-cap" /></div>
                        </div>
                      </div>
                    </div>

                    {/* Row 5: Aadhaar */}
                    <div className="form-group row">
                      <div className="col-md-6">
                        <div className="form-item">
                          <input type="text" name="aadhaarNumber" className="form-control" placeholder="Aadhaar Number *" required />
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

                    {/* Row 6: PAN Card */}
                    <div className="form-group row">
                      <div className="col-md-6">
                        <div className="form-item">
                          <input type="text" name="panNumber" className="form-control" placeholder="PAN Card Number *" required />
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

                    {/* Row 7: Bank Details */}
                    <div className="form-group row">
                      <div className="col-md-4">
                        <div className="form-item">
                          <input type="text" name="bankAccount" className="form-control" placeholder="Bank Account Number *" required />
                          <div className="icon"><i className="fas fa-university" /></div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-item">
                          <input type="text" name="ifscCode" className="form-control" placeholder="IFSC Code *" required />
                          <div className="icon"><i className="fas fa-code" /></div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-item">
                          <input type="text" name="upiId" className="form-control" placeholder="UPI ID *" required />
                          <div className="icon"><i className="fas fa-mobile-alt" /></div>
                        </div>
                      </div>
                    </div>

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

export default BusinessAssociate
