import { Link, useLocation } from 'react-router-dom'

function Header() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  const toggleSidebar = (e) => {
    e.preventDefault()
    document.body.classList.toggle('open-sidebar')
  }

  const toggleSearch = (e) => {
    e.stopPropagation()
    const searchBox = document.getElementById('popup-search-box')
    searchBox.classList.toggle('toggled')
    document.getElementById('popup-search')?.focus()
  }

  const navMenu = (
    <ul>
      <li className="menu-item-has-children active">
        <Link to="/">Home</Link>
        <ul>
          <li><Link to="/">Corporate</Link></li>
        </ul>
      </li>
      <li className="menu-item-has-children">
        <a href="#">Pages</a>
        <ul>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/service">Service</Link></li>
          <li><Link to="/service-details">Service Details</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </li>
      <li className="menu-item-has-children">
        <Link to="/service">Services</Link>
        <ul>
          <li><Link to="/service">Service</Link></li>
          <li><Link to="/service-details">Service Details</Link></li>
        </ul>
      </li>
      <li><Link to="/contact">Contact</Link></li>
    </ul>
  )

  // Sub-pages: header-3 header-4 variant (logo + nav + View All Services + hamburger)
  if (!isHome) {
    return (
      <header className="header header-3 header-4 sticky-active">
        <div className="primary-header">
          <div className="container">
            <div className="primary-header-inner">
              <div className="header-logo">
                <Link to="/">
                  <img src="assets/img/logo/logo-2.png" alt="logo" />
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
                  <Link to="/service" className="bz-primary-btn">View All Services</Link>
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

  // Home page: full header with middle-header + primary-header
  return (
    <header className="header sticky-active">
  <div className="middle-header">
    <div className="container">
      <div className="middle-header-inner">
        <div className="header-logo">
          <div className="shape" />
          <Link to="/">
            <img src="assets/img/logo/logo-1.png" alt="logo" />
          </Link>
        </div>
        <div className="header-items-wrap">
          <div className="header-item">
            <div className="icon"><i className="fa-sharp fa-solid fa-phone" /></div>
            <div className="content">
              <span>Call Us 24/7</span>
              <a href="tel:+26921562148">(+269) 2156 2148</a>
            </div>
          </div>
          <div className="header-item">
            <div className="icon"><i className="fa-sharp fa-solid fa-envelope" /></div>
            <div className="content">
              <span>Mail For Support</span>
              <a href="mailto:info@bizan.com">info@bizan.com</a>
            </div>
          </div>
          <div className="header-item">
            <div className="icon"><i className="fa-sharp fa-solid fa-location-dot" /></div>
            <div className="content">
              <span>Office Address</span>
              <h4 className="address mb-0">259 HGS, Hotland, USA</h4>
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
            <img src="assets/img/logo/logo-2.png" alt="logo" />
          </Link>
        </div>
        <div className="header-menu-wrap">
          <div className="mobile-menu-items">
            {navMenu}
          </div>
        </div>
        <div className="header-right-wrap">
          <div className="header-right">
            <Link to="/contact" className="header-btn">Contact Us</Link>
            <div className="search-icon dl-search-icon" onClick={toggleSearch}>
              <i className="fas fa-magnifying-glass" />
            </div>
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
