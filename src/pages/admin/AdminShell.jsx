import { NavLink, useNavigate } from 'react-router-dom'
import './admin.css'

function AdminShell({ children, title, subtitle }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('startupCreditAdminAuth')
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <img src="/assets/img/logo/logo-1.png" alt="Startup Credit" />
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          <NavLink className="admin-nav-link" to="/admin/users">
            <i className="fa-solid fa-users" aria-hidden="true"></i>
            Users
          </NavLink>
          <NavLink className="admin-nav-link" to="/admin/project-inquiries">
            <i className="fa-solid fa-folder-open" aria-hidden="true"></i>
            Project Inquiries
          </NavLink>
          <NavLink className="admin-nav-link" to="/admin/projects">
            <i className="fa-solid fa-briefcase" aria-hidden="true"></i>
            Project Management
          </NavLink>
        </nav>

        <div className="admin-help-card">
          <i className="fa-solid fa-headset" aria-hidden="true"></i>
          <strong>Need Help?</strong>
          <span>Contact support for admin assistance.</span>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <button className="admin-icon-button" type="button" aria-label="Open menu">
            <i className="fa-solid fa-bars" aria-hidden="true"></i>
          </button>

          <div className="admin-global-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input type="search" placeholder="Search anything..." aria-label="Search anything" />
          </div>

          <div className="admin-profile">
            <span className="admin-avatar">A</span>
            <div>
              <strong>Admin User</strong>
              <span>Super Admin</span>
            </div>
            <button className="admin-logout-button" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-page-heading">
            <div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </div>

          {children}
        </div>
      </section>
    </main>
  )
}

export default AdminShell
