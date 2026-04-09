import { Link, useLocation } from 'react-router-dom'

function Footer() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  if (!isHome) {
    return (
      <footer className="footer-section footer-2 overflow-hidden">
        <div className="shapes">
          <div className="shape shape-1"><img src="assets/img/shapes/footer-shape-1.png" alt="footer" /></div>
          <div className="shape shape-2"><img src="assets/img/shapes/footer-shape-2.png" alt="footer" /></div>
          <div className="shape shape-3"><img src="assets/img/shapes/footer-shape-3.png" alt="footer" /></div>
        </div>
        <div className="container-2">
          <div className="row footer-wrap">
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <div className="widget-header">
                  <div className="footer-logo">
                    <Link to="/"><img src="assets/img/logo/logo-5.png" alt="Startup Credit logo" /></Link>
                  </div>
                </div>
                <p>1110, Plot No. E, Sector 12,<br />Kharghar, Navi Mumbai, Maharashtra</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget widget-space">
                <div className="widget-header">
                  <h3 className="widget-title">Quick Links</h3>
                </div>
                <ul className="footer-list">
                  <li><Link to="/about">About Us</Link></li>
                  <li><a href="/#project-section">Success Stories</a></li>
                  <li><a href="/#testimonial-section">Testimonials</a></li>
                  <li><Link to="/contact">Contact Us</Link></li>
                  <li><a href="/#team-section">Our Team</a></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-2 col-md-6">
              <div className="footer-widget">
                <div className="widget-header">
                  <h3 className="widget-title">Information</h3>
                </div>
                <ul className="footer-list">
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/service">Our Services</Link></li>
                  <li><Link to="/terms-conditions">T&amp;C Policy</Link></li>
                  <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="copyright-area area-2">
          <div className="container">
            <div className="row copyright-content">
              <div className="col-md-6">
                <p>&copy; 2026 Bellmonte Industries Pvt Ltd. All Rights Reserved.</p>
              </div>
              <div className="col-md-6">
                <ul className="copy-list">
                  <li><Link to="/terms-conditions">T&amp;C Policy</Link></li>
                  <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="footer-section pt-120 overflow-hidden">
      <div className="footer-shape">
        <img src="assets/img/shapes/footer-shape.png" alt="Footer Shape" />
      </div>
      <div className="footer-imgs">
        <div className="footer-img img-1"><img src="assets/img/images/footer-img-1.png" alt="Footer Image 1" /></div>
        <div className="footer-img img-2"><img src="assets/img/images/footer-img-2.png" alt="Footer Image 2" /></div>
      </div>
      <div className="container">
        <div className="footer-top">
          <div className="section-heading white-content">
            <h2 className="section-title">Contact us to know grow your <br /> business to the next level with us</h2>
            <Link to="/contact" className="bz-primary-btn">LET'S STARTED NOW <i className="fas fa-arrow-right" /></Link>
          </div>
        </div>
        <div className="row footer-wrap">
          <div className="col-lg-3 col-md-6">
            <div className="footer-widget">
              <div className="widget-header">
                <div className="footer-logo">
                  <Link to="/"><img src="assets/img/logo/logo-1.png" alt="Startup Credit Logo" /></Link>
                </div>
              </div>
              <p>1110, Plot No. E, Sector 12,<br />Kharghar, Navi Mumbai, Maharashtra</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="footer-widget widget-space">
              <div className="widget-header">
                <h3 className="widget-title">Quick Links</h3>
              </div>
              <ul className="footer-list">
                <li><Link to="/about">About Us</Link></li>
                <li><a href="/#testimonial-section">Testimonials</a></li>
                <li><a href="/#project-section">Success Stories</a></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><a href="/#team-section">Our Team</a></li>
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-6">
            <div className="footer-widget">
              <div className="widget-header">
                <h3 className="widget-title">Information</h3>
              </div>
              <ul className="footer-list">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/service">Our Services</Link></li>
                <li><Link to="/terms-conditions">T&amp;C Policy</Link></li>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright-area">
        <div className="container">
          <div className="row copyright-content">
            <div className="col-md-6">
              <p>&copy; 2026 Bellmonte Industries Pvt Ltd. All Rights Reserved.</p>
            </div>
            <div className="col-md-6">
              <ul className="copy-list">
                <li><Link to="/terms-conditions">T&amp;C Policy</Link></li>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
