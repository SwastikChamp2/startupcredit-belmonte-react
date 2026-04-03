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
    // TODO: Paste converted JSX from contact.html
    // Sections: contact-section, contact-info, map, etc.
    // Do NOT include header, footer, preloader, sidebar, search-popup, scroll-percentage
    <>
      <PageHeader title="Contact Us" breadcrumb="Contact Us" />
      <section className="contact-section pt-130 pb-130">
    <div className="container">
      <div className="row gy-lg-0 gy-5">
        <div className="col-lg-7">
          <div className="blog-contact-form">
            <h2 className="title mb-0">Leave A Reply</h2>
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
                      <div className="icon"><i className="  fas fa-envelope" /></div>
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
                      <div className="icon"><i className="fas fa-messages" /></div>
                    </div>
                  </div>
                </div>
                <div className="submit-btn">
                  <button id="submit" className="bz-primary-btn" type="submit">Submit Message</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-5 col-md-12">
          <div className="contact-content">
            <div className="contact-top">
              <h3 className="title">Office Information</h3>
              <p>Completely recapitalize 24/7 communities via standards compliant metrics whereas.</p>
            </div>
            <div className="contact-list">
              <div className="list-item">
                <div className="icon">
                  <i className="  fas fa-phone" />
                </div>
                <div className="content">
                  <h4 className="title">Phone Number &amp; Email</h4>
                  <span><a href="tel:+65485965789">(+65) - 48596 - 5789</a></span>
                  <span><a href="mailto:hello@bizan.com">hello@bizan.com</a></span>
                </div>
              </div>
              <div className="list-item">
                <div className="icon">
                  <i className="  fas fa-location-dot" />
                </div>
                <div className="content">
                  <h4 className="title">Our Office Address</h4>
                  <p>2690 Hilton Street Victoria Road, <br />New York, Canada</p>
                </div>
              </div>
              <div className="list-item">
                <div className="icon">
                  <i className="  fas fa-clock" />
                </div>
                <div className="content">
                  <h4 className="title">Official Work Time</h4>
                  <span>Monday - Friday: 09:00 - 20:00</span>
                  <span>Sunday &amp; Saturday: 10:30 - 22:00</span>
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
