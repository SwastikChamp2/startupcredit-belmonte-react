import { useState } from 'react'
import PageHeader from '../components/PageHeader'

function Contact() {
  const [msg, setMsg] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setMsg('Your message has been sent successfully!')
    e.target.reset()
    setTimeout(() => setMsg(''), 5000)
  }

  return (
    <>
      <PageHeader title="Contact Us" breadcrumb="Contact Us" />

      <section className="contact-section pt-130 pb-130">
        <div className="container">
          <div className="row gy-lg-0 gy-5">
            <div className="col-lg-7">
              <div className="blog-contact-form">
                <h2 className="title mb-0">Send us a Message</h2>
                <p className="mb-30 mt-10">Fill-up The Form and Message us of your amazing question</p>
                <div className="request-form">
                  {msg && <div className="alert alert-success mb-3">{msg}</div>}
                  <form onSubmit={handleSubmit} id="ajax_contact" className="form-horizontal">
                    <div className="form-group row">
                      <div className="col-md-6">
                        <div className="form-item">
                          <input type="text" id="fullname" name="fullname" className="form-control" placeholder="Your Name" />
                          <div className="icon"><i className="fas fa-user" /></div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-item">
                          <input type="email" id="email" name="email" className="form-control" placeholder="Your Email" />
                          <div className="icon"><i className="fas fa-envelope" /></div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-md-12">
                        <div className="form-item">
                          <input type="text" id="subject" name="subject" className="form-control" placeholder="Subject" />
                          <div className="icon"><i className="fas fa-heading" /></div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-md-12">
                        <div className="form-item message-item">
                          <textarea id="message" name="message" cols={30} rows={5} className="form-control address" placeholder="Message" defaultValue={""} />
                          <div className="icon"><i className="fas fa-comment-dots" /></div>
                        </div>
                      </div>
                    </div>
                    <div className="submit-btn">
                      <button id="submit" className="bz-primary-btn" type="submit">SUBMIT MESSAGE</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-md-12">
              <div className="contact-content">
                <div className="contact-top">
                  <h3 className="title">Office Information</h3>
                  <p>Feel free to reach out to us through any of the channel convenient to you</p>
                </div>
                <div className="contact-list">
                  <div className="list-item">
                    <div className="icon">
                      <i className="fas fa-phone" />
                    </div>
                    <div className="content">
                      <h4 className="title">Phone Number &amp; Email</h4>
                      <span><a href="tel:+919850344666">+91 9850344666</a></span>
                      <span><a href="mailto:info@startupcredit.in">info@startupcredit.in</a></span>
                    </div>
                  </div>
                  <div className="list-item">
                    <div className="icon">
                      <i className="fas fa-location-dot" />
                    </div>
                    <div className="content">
                      <h4 className="title">Our Office Address</h4>
                      <p>1110, Plot No. E, Sector 12,<br />Kharghar, Navi Mumbai, Maharashtra</p>
                    </div>
                  </div>
                  <div className="list-item">
                    <div className="icon">
                      <i className="fas fa-clock" />
                    </div>
                    <div className="content">
                      <h4 className="title">Official Work Time</h4>
                      <span>Monday - Friday: 09:00 - 20:00</span>
                      <span>Sunday &amp; Saturday: 10:30 - 16:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact
