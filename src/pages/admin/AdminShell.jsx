import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { adminAuth } from '../../firebase'
import './admin.css'

function AdminShell({ children, title, subtitle }) {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  // 'checking' | 'ok' | 'no-user' | 'no-claim'
  const [adminAuthState, setAdminAuthState] = useState('checking')
  const [signedInAs, setSignedInAs] = useState('')

  // Watch the Firebase Auth state. If the current user changes (e.g. someone
  // signed in via the public Login modal in another tab) or doesn't have the
  // admin custom claim, we surface that explicitly instead of letting the
  // Firestore listeners explode with cryptic permission errors.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(adminAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        setAdminAuthState('no-user')
        setSignedInAs('')
        return
      }
      try {
        // Force-refresh so we get the latest custom claims.
        const tokenResult = await firebaseUser.getIdTokenResult(true)
        setSignedInAs(firebaseUser.email || firebaseUser.uid)
        if (tokenResult.claims?.admin === true) {
          setAdminAuthState('ok')
        } else {
          setAdminAuthState('no-claim')
        }
      } catch (err) {
        console.warn('AdminShell: token check failed', err)
        setAdminAuthState('no-claim')
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    localStorage.removeItem('startupCreditAdminAuth')
    // Drop the admin Firebase session so listeners stop trying to read.
    // Public auth (different app instance) is untouched.
    await signOut(adminAuth).catch(() => {})
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="admin-shell" style={!isSidebarOpen ? { display: 'block' } : {}}>
      {isSidebarOpen && (
        <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-logo">
            <img src="/assets/img/logo/logo-1.png" alt="Startup Credit" />
            <button 
              aria-label="Close sidebar"
              className="admin-sidebar-close"
              onClick={() => setIsSidebarOpen(false)}
              type="button"
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
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

          {adminAuthState === 'checking' ? (
            <div className="admin-loader-container">
              <div className="admin-loader"></div>
              <span>Verifying admin access...</span>
            </div>
          ) : adminAuthState !== 'ok' ? (
            <div style={{
              margin: '12px 0',
              padding: '16px 18px',
              background: '#fef2f2',
              color: '#991b1b',
              borderRadius: 8,
              fontSize: 14,
              lineHeight: 1.5,
            }}>
              <strong>Admin access not active.</strong>{' '}
              {adminAuthState === 'no-user' ? (
                <>You aren&apos;t signed in to Firebase. Sign back in to /admin/login.</>
              ) : (
                <>
                  You&apos;re signed in as <code>{signedInAs}</code>, but this account doesn&apos;t
                  have the <code>admin</code> custom claim. Either you signed in via the
                  public Login modal (which replaced the admin session), or the admin
                  claim hasn&apos;t been granted yet.
                </>
              )}
              <div style={{ marginTop: 12 }}>
                <button
                  className="admin-link-button"
                  type="button"
                  onClick={handleLogout}
                  style={{ marginRight: 8 }}
                >
                  Sign out and re-login as admin
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </section>
    </main>
  )
}

export default AdminShell
