import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import PageHeader from '../components/PageHeader'
import FileUploadBox from '../components/FileUploadBox'
import RequireAuth from '../components/RequireAuth'
import SubmissionModal from '../components/SubmissionModal'
import {
  fetchExistingBusinessAssociateApplication,
  submitBusinessAssociateApplication,
} from '../services/formsApi'
import { useAuth } from '../hooks/useAuth'

const datePickerStyles = `
  .react-datepicker-wrapper {
    width: 100%;
    display: block;
  }
  .react-datepicker__input-container {
    display: block;
  }
  .react-datepicker-popper {
    z-index: 1000 !important;
    padding-top: 0 !important;
    margin-top: -15px !important; /* Reduce gap */
  }
  .react-datepicker {
    font-family: inherit;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }
  .react-datepicker__header {
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding-top: 12px;
  }
  .react-datepicker__day--selected {
    background-color: #1769e8 !important;
    border-radius: 8px;
  }
  .react-datepicker__day:hover {
    border-radius: 8px;
  }
  .react-datepicker__current-month {
    font-weight: 700;
    color: #1e293b;
  }
  /* Fix icon alignment specifically for the DatePicker field */
  .date-picker-item .icon {
    top: 28px !important;
    right: 25px !important;
    pointer-events: none;
  }
  .business-associate-status-gate {
    padding: 42px 20px 18px;
  }
  .business-associate-status-gate .require-auth-gate__card {
    box-shadow: 0 18px 50px rgba(8, 17, 41, 0.11);
  }
  .business-associate-status-gate__pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(22, 163, 74, 0.1);
    color: #15803d;
    font-size: 13px;
    font-weight: 800;
  }
  .business-associate-status-gate__message {
    font-weight: 800;
    color: #101d36;
  }
  .business-associate-form .form-item .form-control {
    padding-right: 64px;
  }
  .business-associate-form .form-item .icon {
    right: 22px;
    pointer-events: none;
  }
`

const mobileValidationProps = {
  inputMode: 'numeric',
  pattern: '[0-9]{10}',
  maxLength: 10,
  title: 'Please enter a 10-digit mobile number',
  onInput: (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)
  },
  onInvalid: (e) => {
    e.target.setCustomValidity('Please enter a valid 10-digit mobile number')
  },
  onChange: (e) => {
    e.target.setCustomValidity('')
  },
}

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

function BusinessAssociate() {
  const { user } = useAuth()
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [aadhaarFile, setAadhaarFile] = useState(null)
  const [panFile, setPanFile] = useState(null)
  const [dob, setDob] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [existingApplication, setExistingApplication] = useState(null)
  const [checkingExisting, setCheckingExisting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const checkExistingApplication = async () => {
      if (!user?.uid && !user?.email) {
        setExistingApplication(null)
        return
      }

      setCheckingExisting(true)
      try {
        const existing = await fetchExistingBusinessAssociateApplication({
          uid: user.uid,
          email: user.email,
        })
        if (!cancelled) setExistingApplication(existing)
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err?.message || 'Could not check your existing application status.')
        }
      } finally {
        if (!cancelled) setCheckingExisting(false)
      }
    }

    checkExistingApplication()

    return () => {
      cancelled = true
    }
  }, [user])

  const existingStatus = user?.role === 'Associate' ? 'Verified' : existingApplication?.status || ''
  const hasActiveApplication =
    existingStatus === 'Inquiry Submitted' ||
    existingStatus === 'Verification In progress' ||
    existingStatus === 'Verified'
  const existingApplicationMessage =
    existingStatus === 'Verified'
      ? 'You are already a verified business associate.'
      : existingStatus === 'Rejected'
      ? 'Your previous business associate application was rejected. You may submit a revised application.'
      : hasActiveApplication
      ? 'Your business associate application is already under review.'
      : ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (hasActiveApplication) {
      setErrorMsg(existingApplicationMessage)
      return
    }

    const form = e.target
    const fd = new FormData(form)
    const fields = {
      firstName: fd.get('firstName')?.toString().trim() || '',
      middleName: fd.get('middleName')?.toString().trim() || '',
      lastName: fd.get('lastName')?.toString().trim() || '',
      email: fd.get('email')?.toString().trim() || '',
      mobile: fd.get('mobile')?.toString().trim() || '',
      profession: fd.get('profession')?.toString().trim() || '',
      dob: dob ? dob.toISOString().split('T')[0] : '',
      educationalStatus: fd.get('educationalStatus')?.toString() || '',
      aadhaarNumber: fd.get('aadhaarNumber')?.toString().trim() || '',
      panNumber: fd.get('panNumber')?.toString().trim() || '',
      bankAccount: fd.get('bankAccount')?.toString().trim() || '',
      ifscCode: fd.get('ifscCode')?.toString().trim() || '',
      upiId: fd.get('upiId')?.toString().trim() || '',
    }

    setSubmitting(true)
    try {
      await submitBusinessAssociateApplication({
        fields,
        files: { aadhaarFile, panFile },
      })
      setShowModal(true)
      setExistingApplication({
        status: 'Inquiry Submitted',
        email: fields.email,
        submittedBy: { uid: user?.uid || '', email: user?.email || fields.email },
      })
      form.reset()
      setAadhaarFile(null)
      setPanFile(null)
      setDob(null)
    } catch (err) {
      setErrorMsg(err?.message || 'Could not submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style>{datePickerStyles}</style>
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
      <RequireAuth
        title="Login to apply as a business associate"
        message="Please log in or create an account before submitting the application. Your application is linked to your account so we can follow up with you."
      >
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
                  <SubmissionModal 
                    isOpen={showModal} 
                    onClose={() => setShowModal(false)}
                    title="Application Submitted!"
                    message="Your business associate application has been received successfully. Our team will review your details and get back to you soon."
                  />
                  {errorMsg && <div className="alert alert-danger mb-3">{errorMsg}</div>}
                  {checkingExisting && (
                    <div className="alert alert-info mb-3">Checking your existing business associate application...</div>
                  )}
                  {hasActiveApplication ? (
                    <div className="require-auth-gate business-associate-status-gate">
                      <div className="require-auth-gate__card">
                        <div className="require-auth-gate__icon" aria-hidden="true">
                          <i className="fa-solid fa-circle-check" />
                        </div>
                        <p className="business-associate-status-gate__message">{existingApplicationMessage}</p>
                        <span className="business-associate-status-gate__pill">
                          <i className="fa-solid fa-id-badge" aria-hidden="true" />
                          Status: {existingStatus}
                        </span>
                      </div>
                    </div>
                  ) : (
                  <>
                  {existingApplicationMessage && !errorMsg && (
                    <div className="alert alert-info mb-3">
                      {existingApplicationMessage}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="form-horizontal business-associate-form">

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
                          <input type="tel" name="mobile" className="form-control" placeholder="Mobile Number *" required {...mobileValidationProps} />
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
                        <div className="form-item date-picker-item">
                          <DatePicker
                            selected={dob}
                            onChange={(date) => setDob(date)}
                            className="form-control"
                            placeholderText="Date of Birth *"
                            dateFormat="dd/MM/yyyy"
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={100}
                            maxDate={new Date()}
                            required
                            popperPlacement="bottom-start"
                          />
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
                          <input type="text" name="aadhaarNumber" className="form-control" placeholder="Aadhaar Number (Optional)" {...aadhaarValidationProps} />
                          <div className="icon"><i className="fas fa-id-card" /></div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <FileUploadBox
                          name="aadhaarUpload"
                          label="Upload Aadhaar Card (Optional)"
                          file={aadhaarFile}
                          onFileChange={(f) => setAadhaarFile(f)}
                        />
                      </div>
                    </div>

                    {/* Row 6: PAN Card */}
                    <div className="form-group row">
                      <div className="col-md-6">
                        <div className="form-item">
                          <input type="text" name="panNumber" className="form-control" placeholder="PAN Card Number (Optional)" {...panValidationProps} />
                          <div className="icon"><i className="fas fa-id-badge" /></div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <FileUploadBox
                          name="panUpload"
                          label="Upload PAN Card (Optional)"
                          file={panFile}
                          onFileChange={(f) => setPanFile(f)}
                        />
                      </div>
                    </div>

                    {/* Row 7: Bank Details */}
                    <div className="form-group row">
                      <div className="col-md-4">
                        <div className="form-item">
                          <input type="text" name="bankAccount" className="form-control" placeholder="Bank A/c No. (Optional)" />
                          <div className="icon"><i className="fas fa-university" /></div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-item">
                          <input type="text" name="ifscCode" className="form-control" placeholder="IFSC Code (Optional)" />
                          <div className="icon"><i className="fas fa-code" /></div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-item">
                          <input type="text" name="upiId" className="form-control" placeholder="UPI ID (Optional)" />
                          <div className="icon"><i className="fas fa-mobile-alt" /></div>
                        </div>
                      </div>
                    </div>

                    <div className="submit-btn">
                      <button className="bz-primary-btn" type="submit" disabled={submitting || checkingExisting}>
                        {submitting ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
                      </button>
                    </div>
                  </form>
                  </>
                  )}
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

export default BusinessAssociate
