import { Link, useLocation } from 'react-router-dom'

function Footer() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  if (!isHome) {
    // Sub-page footer (footer-2)
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
                    <Link to="/"><img src="assets/img/logo/logo-5.png" alt="img" /></Link>
                  </div>
                </div>
                <p>1234, Restaurant St, South City <br />New York 0124</p>
                <ul className="footer-social">
                  <li><a href="#"><i className="fab fa-facebook-f" /></a></li>
                  <li><a href="#"><i className="fab fa-instagram" /></a></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget widget-space">
                <div className="widget-header">
                  <h3 className="widget-title">Quick Links</h3>
                </div>
                <ul className="footer-list">
                  <li><a href="#">About Us</a></li>
                  <li><a href="#">Portfolio</a></li>
                  <li><a href="#">Testimonials</a></li>
                  <li><a href="#">Blog</a></li>
                  <li><a href="#">Contact Us</a></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-2 col-md-6">
              <div className="footer-widget">
                <div className="widget-header">
                  <h3 className="widget-title">Information</h3>
                </div>
                <ul className="footer-list">
                  <li><a href="#">Request Service</a></li>
                  <li><a href="#">Our Work</a></li>
                  <li><a href="#">What We Do</a></li>
                  <li><a href="#">Our Process</a></li>
                  <li><a href="#">Reviews</a></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="footer-widget widget-space">
                <div className="widget-header">
                  <h3 className="widget-title">Our Newsletter</h3>
                </div>
                <p>Sign up to Private's weekly newsletter to get the latest updates.</p>
                <div className="footer-form form-2 mb-20">
                  <form action="#" className="rr-subscribe-form">
                    <input className="form-control" type="email" name="email" placeholder="Email address" />
                    <input type="hidden" name="action" defaultValue="mailchimpsubscribe" />
                    <button className="submit">Subscribe</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="copyright-area area-2">
          <div className="container">
            <div className="row copyright-content">
              <div className="col-md-6">
                <p>&copy; 2024 Bizan. All Rights Reserved.</p>
              </div>
              <div className="col-md-6">
                <ul className="copy-list">
                  <li><a href="#">Terms &amp; Conditions</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  // Home page footer
  return (
    <footer className="footer-section pt-120 overflow-hidden">
  <div className="footer-shape">
    <img src="assets/img/shapes/footer-shape.png" alt="shape" />
  </div>
  <div className="footer-imgs">
    <div className="footer-img img-1"><img src="assets/img/images/footer-img-1.png" alt="img" /></div>
    <div className="footer-img img-2"><img src="assets/img/images/footer-img-2.png" alt="img" /></div>
  </div>
  <div className="container">
    <div className="footer-top">
      <div className="section-heading white-content">
        <h2 className="section-title">Learn How We Create Unmatched <br />Solutions For Businesses</h2>
        <Link to="/contact" className="bz-primary-btn">Lets Get Started Now <i className="fas fa-arrow-right" /></Link>
      </div>
    </div>
    <div className="row footer-wrap">
      <div className="col-lg-3 col-md-6">
        <div className="footer-widget">
          <div className="widget-header">
            <div className="footer-logo">
              <Link to="/"><img src="assets/img/logo/logo-1.png" alt="img" /></Link>
            </div>
          </div>
          <p>1234, Restaurant St, South City <br />New York 0124</p>
          <ul className="footer-social">
            <li><a href="#"><i className="fa-brands fa-facebook-f" /></a></li>
            <li><a href="#"><i className="fa-brands fa-instagram" /></a></li>
          </ul>
        </div>
      </div>
      <div className="col-lg-3 col-md-6">
        <div className="footer-widget widget-space">
          <div className="widget-header">
            <h3 className="widget-title">Quick Links</h3>
          </div>
          <ul className="footer-list">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/">Portfolio</Link></li>
            <li><Link to="/contact">Testimonials</Link></li>
            <li><Link to="/">Blog</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="col-lg-2 col-md-6">
        <div className="footer-widget">
          <div className="widget-header">
            <h3 className="widget-title">Information</h3>
          </div>
          <ul className="footer-list">
            <li><Link to="/service">Request Service</Link></li>
            <li><Link to="/">Our Work</Link></li>
            <li><Link to="/about">What We Do</Link></li>
            <li><Link to="/about">Our Process</Link></li>
            <li><Link to="/contact">Reviews</Link></li>
          </ul>
        </div>
      </div>
      <div className="col-lg-4 col-md-6">
        <div className="footer-widget widget-space">
          <div className="widget-header">
            <h3 className="widget-title">Our Newsletter</h3>
          </div>
          <p>Sign up to Private's weekly newsletter to get the latest updates.</p>
          <div className="footer-form mb-20">
            <form action="#" className="rr-subscribe-form">
              <input className="form-control" type="email" name="email" placeholder="Email address" />
              <input type="hidden" name="action" defaultValue="mailchimpsubscribe" />
              <button className="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div className="copyright-area">
    <div className="container">
      <div className="row copyright-content">
        <div className="col-md-6">
          <p>&copy; 2024 Bizan. All Rights Reserved.</p>
        </div>
        <div className="col-md-6">
          <ul className="copy-list">
            <li><Link to="/contact">Terms &amp; Conditions</Link></li>
            <li><Link to="/contact">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</footer>
  )
}

export default Footer
