import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import './admin.css'

function AdminShell({ children, title, subtitle }) {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('startupCreditAdminAuth')
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="admin-shell" style={!isSidebarOpen ? { display: 'block' } : {}}>
      {isSidebarOpen && (
        <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-logo" style={{ position: 'relative' }}>
            <img src="/assets/img/logo/logo-1.png" alt="Startup Credit" />
            <button 
              onClick={() => setIsSidebarOpen(false)}
              style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
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
          <NavLink className="admin-nav-link" to="/admin/investors">
            <i className="fa-solid fa-user-tie" aria-hidden="true"></i>
            Investor Management
          </NavLink>
          <NavLink className="admin-nav-link" to="/admin/business-associates">
            <i className="fa-solid fa-id-card-clip" aria-hidden="true"></i>
            Business Associate Inquiries
          </NavLink>
          <NavLink className="admin-nav-link" to="/admin/business-associate-management">
            <i className="fa-solid fa-handshake" aria-hidden="true"></i>
            Business Associate Management
          </NavLink>
          <NavLink className="admin-nav-link" to="/admin/contact-us">
            <i className="fa-regular fa-envelope" aria-hidden="true"></i>
            Contact Us Management
          </NavLink>
          <NavLink className="admin-nav-link" to="/admin/services">
            <i className="fa-solid fa-server" aria-hidden="true"></i>
            Service Management
          </NavLink>
          <NavLink className="admin-nav-link" to="/admin/government-schemes">
            <i className="fa-solid fa-building-columns" aria-hidden="true"></i>
            Government Scheme Management
          </NavLink>
        </nav>

          <div className="admin-help-card">
            <i className="fa-solid fa-chart-line" aria-hidden="true"></i>
            <strong>Drive Growth</strong>
            <span>Manage business projects and facilitate funding efficiently.</span>
          </div>
        </aside>
      )}

      <section className="admin-main">
        <header className="admin-topbar">
          {!isSidebarOpen ? (
            <button className="admin-icon-button" type="button" aria-label="Open menu" onClick={() => setIsSidebarOpen(true)}>
              <i className="fa-solid fa-bars" aria-hidden="true"></i>
            </button>
          ) : (
            <div style={{ width: '42px' }}></div>
          )}

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
            <button className="admin-logout-button" type="button" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-solid fa-right-from-bracket"></i>
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
