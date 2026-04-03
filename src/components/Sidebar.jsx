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
      <Link to="/"><img src="assets/img/logo/logo-2.png" alt="logo" /></Link>
    </div>
    <div className="side-menu-wrap" />
    <div className="side-menu-about">
      <div className="side-menu-header">
        <h3>About Us</h3>
      </div>
      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore
        et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud nisi ut aliquip ex ea commodo
        consequat.</p>
      <Link to="/contact" className="bz-primary-btn">Contact Us</Link>
    </div>
    <div className="side-menu-contact">
      <div className="side-menu-header">
        <h3>Contact Us</h3>
      </div>
      <ul className="side-menu-list">
        <li>
          <i className="fas fa-map-marker-alt" />
          <p>Valentin, Street Road 24, New York, </p>
        </li>
        <li>
          <i className="fas fa-phone" />
          <a href="tel:+000123456789">+000 123 (456) 789</a>
        </li>
        <li>
          <i className="fas fa-envelope-open-text" />
          <a href="mailto:bizancontact@gmail.com">bizancontact@gmail.com</a>
        </li>
      </ul>
    </div>
    <ul className="side-menu-social">
      <li className="facebook"><a href="#"><i className="fab fa-facebook-f" /></a></li>
      <li className="instagram"><a href="#"><i className="fab fa-instagram" /></a></li>
    </ul>
  </div>
</div>
  )
}

export default Sidebar
