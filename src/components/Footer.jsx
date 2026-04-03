import { Link } from 'react-router-dom'

function Footer() {
  return (
    // TODO: Paste converted JSX from the <footer> section of index.html
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
          <p>© 2024 Bizan. All Rights Reserved.</p>
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
