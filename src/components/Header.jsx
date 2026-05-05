import { Link, useLocation } from 'react-router-dom'
import '../styles/header-fixes.css'

function Header() {
  const { pathname } = useLocation()
  const isAbout = pathname === '/about'
  const isGovernmentSchemes = pathname === '/government-schemes' || pathname.startsWith('/government-schemes/')

  const toggleSidebar = (e) => {
    e.preventDefault()
    document.body.classList.toggle('open-sidebar')
  }

  const navMenu = (
    <ul>
      <li className={pathname === '/' ? 'active' : ''}>
        <Link to="/">HOME</Link>
      </li>
      <li className={pathname === '/about' ? 'active' : ''}><Link to="/about">ABOUT</Link></li>
      <li className={pathname === '/service' || pathname === '/service-details' ? 'active' : ''}>
        <Link to="/service">SERVICES</Link>
      </li>
      <li className={isGovernmentSchemes ? 'active' : ''}><Link to="/government-schemes">GOVERNMENT SCHEME</Link></li>
      <li className={pathname === '/select-project' ? 'active' : ''}><Link to="/select-project">SELECT PROJECT</Link></li>
      <li className={pathname === '/business-associate' ? 'active' : ''}><Link to="/business-associate">BUSINESS ASSOCIATE</Link></li>
      <li className={pathname === '/become-investor' ? 'active' : ''}><Link to="/become-investor">BECOME INVESTOR</Link></li>
      <li className={pathname === '/contact' ? 'active' : ''}><Link to="/contact">CONTACT US</Link></li>
    </ul>
  )

  // About page: header-3 header-4 variant
  if (isAbout) {
    return (
      <header className="header header-3 header-4 sticky-active">
        <div className="primary-header">
          <div className="container">
            <div className="primary-header-inner">
              <div className="header-logo">
                <Link to="/">
                  <img src="assets/img/logo/logo-2.png" alt="Startup Credit logo" />
                </Link>
              </div>
              <div className="inner-left">
                <div className="header-menu-wrap">
                  <div className="mobile-menu-items">
                    {navMenu}
                  </div>
                </div>
              </div>
              <div className="header-right-wrap">
                <div className="header-right">
                  <Link to="/contact" className="bz-primary-btn">CONTACT US</Link>
                  <div className="sidebar-icon-2">
                    <button className="sidebar-trigger open" onClick={toggleSidebar}>
                      <span />
                      <span />
                      <span />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  // All other pages: full header with middle-header + primary-header
  return (
    <header className="header sticky-active">
      <div className="middle-header">
        <div className="container">
          <div className="middle-header-inner">
            <div className="header-logo">
              <div className="shape" />
              <Link to="/">
                <img src="assets/img/logo/logo-1.png" alt="Startup Credit Logo" />
              </Link>
            </div>
            <div className="header-items-wrap">
              <div className="header-item">
                <div className="icon"><i className="fa-sharp fa-solid fa-phone" /></div>
                <div className="content">
                  <span>CALL US</span>
                  <a href="tel:+919850344666">9850344666</a>
                </div>
              </div>
              <div className="header-item">
                <div className="icon"><i className="fa-sharp fa-solid fa-envelope" /></div>
                <div className="content">
                  <span>MAIL FOR SUPPORT</span>
                  <a href="mailto:info@startupcredit.in">info@startupcredit.in</a>
                </div>
              </div>
              <div className="header-item">
                <div className="icon"><i className="fa-sharp fa-solid fa-location-dot" /></div>
                <div className="content">
                  <span>OFFICE ADDRESS</span>
                  <a href="https://maps.app.goo.gl/8EStxiiwF8tQ1tvJ6" target="_blank" rel="noreferrer" className="address mb-0 text-decoration-none">Kharghar, Navi Mumbai, India</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="primary-header">
        <div className="container">
          <div className="primary-header-inner">
            <div className="header-logo d-lg-none">
              <Link to="/">
                <img src="assets/img/logo/logo-2.png" alt="Startup Credit Logo" />
              </Link>
            </div>
            <div className="header-menu-wrap">
              <div className="mobile-menu-items">
                {navMenu}
              </div>
            </div>
            <div className="header-right-wrap">
              <div className="header-right">
                <Link to="/contact" className="header-btn">CONTACT US</Link>
                <div className="sidebar-icon">
                  <button className="sidebar-trigger open" onClick={toggleSidebar}>
                    <span />
                    <span />
                    <span />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
