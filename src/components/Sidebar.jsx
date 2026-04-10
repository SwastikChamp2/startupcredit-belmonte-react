import { Link } from 'react-router-dom'

function Sidebar() {
  const closeSidebar = (e) => {
    e.preventDefault()
    document.body.classList.remove('open-sidebar')
  }

  return (
    <div id="sidebar-area" className="sidebar-area">
      <button className="sidebar-trigger close" onClick={closeSidebar}>
        <svg className="sidebar-close" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16px" height="12.7px" viewBox="0 0 16 12.7" style={{"enableBackground":"new 0 0 16 12.7"}} xmlSpace="preserve">
          <g>
            <rect x={0} y="5.4" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -2.1569 7.5208)" width={16} height={2} />
            <rect x={0} y="5.4" transform="matrix(0.7071 0.7071 -0.7071 0.7071 6.8431 -3.7929)" width={16} height={2} />
          </g>
        </svg>
      </button>
      <div className="side-menu-content">
        <div className="side-menu-logo">
          <Link to="/"><img src="assets/img/logo/logo-2.png" alt="Startup Credit Logo" /></Link>
        </div>
        <div className="side-menu-wrap" />
        <div className="side-menu-contact">
          <div className="side-menu-header">
            <h3>Quick Links</h3>
          </div>
          <ul className="side-menu-list">
            <li>
              <i className="fas fa-house" />
              <Link to="/" onClick={closeSidebar}>Home</Link>
            </li>
            <li>
              <i className="fas fa-circle-info" />
              <Link to="/about" onClick={closeSidebar}>About</Link>
            </li>
            <li>
              <i className="fas fa-briefcase" />
              <Link to="/service" onClick={closeSidebar}>Services</Link>
            </li>
            <li>
              <i className="fas fa-envelope" />
              <Link to="/contact" onClick={closeSidebar}>Contact Us</Link>
            </li>
            <li>
              <i className="fas fa-diagram-project" />
              <Link to="/select-project" onClick={closeSidebar}>Select Project</Link>
            </li>
            <li>
              <i className="fas fa-handshake-angle" />
              <Link to="/business-associate" onClick={closeSidebar}>Business Associate</Link>
            </li>
            <li>
              <i className="fas fa-chart-line" />
              <Link to="/become-investor" onClick={closeSidebar}>Become Investor</Link>
            </li>
          </ul>
        </div>
        <div className="side-menu-about">
          <div className="side-menu-header">
            <h3>About Us</h3>
          </div>
          <p>From government schemes to private investors, we simplify startup financing by connecting you with the right funding options and expertly guide you through the complete process.</p>
          <Link to="/contact" className="bz-primary-btn" onClick={closeSidebar}>CONTACT US</Link>
        </div>
        <div className="side-menu-contact">
          <div className="side-menu-header">
            <h3>Contact Us</h3>
          </div>
          <ul className="side-menu-list">
            <li>
              <i className="fas fa-map-marker-alt" />
              <a href="https://maps.app.goo.gl/8EStxiiwF8tQ1tvJ6" target="_blank" rel="noreferrer" className="text-decoration-none" style={{color: 'inherit'}}>1110, Plot No. E, Sector 12, Kharghar, Navi Mumbai, Maharashtra 410210</a>
            </li>
            <li>
              <i className="fas fa-phone" />
              <a href="tel:+919850344666">+91 9850344666</a>
            </li>
            <li>
              <i className="fas fa-envelope-open-text" />
              <a href="mailto:info@startupcredit.in">info@startupcredit.in</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
