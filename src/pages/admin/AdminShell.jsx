import { useState } from 'react'
import { Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth, firebaseProjectId } from '../../firebase'
import { useAdminIdentity } from '../../hooks/useAdminIdentity'
import { useAuthModal } from '../../hooks/useAuthModal'
import './admin.css'

const ADMIN_ROLES = new Set(['Admin', 'Super Admin'])

const NAV_ITEMS = [
  { to: '/admin/users', label: 'Users', icon: 'fa-users' },
  { to: '/admin/project-inquiries', label: 'Project Inquiries', icon: 'fa-folder-open' },
  { to: '/admin/projects', label: 'Project Management', icon: 'fa-briefcase' },
  { to: '/admin/investors', label: 'Investor Management', icon: 'fa-user-tie' },
  { to: '/admin/business-associates', label: 'Business Associate Inquiries', icon: 'fa-id-card-clip' },
  { to: '/admin/business-associate-management', label: 'Business Associate Management', icon: 'fa-handshake' },
  { to: '/admin/contact-us', label: 'Contact Us Management', icon: 'fa-envelope' },
  { to: '/admin/truck-inquiries', label: 'Truck Inquiry', icon: 'fa-truck' },
  { to: '/admin/services', label: 'Service Management', icon: 'fa-server' },
  { to: '/admin/government-schemes', label: 'Government Scheme Management', icon: 'fa-building-columns' },
]

function AdminShell({ children, title, subtitle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { openAuthModal } = useAuthModal()
  const { user, userRole, profileExists, disabled, loading, error } = useAdminIdentity()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isFullAdmin = ADMIN_ROLES.has(userRole)
  const isAssociatePage =
    location.pathname === '/admin/project-inquiries' ||
    location.pathname === '/admin/projects' ||
    location.pathname.startsWith('/admin/projects/') ||
    location.pathname === '/admin/business-associate-management' ||
    /^\/admin\/business-associates\/[^/]+$/.test(location.pathname)

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/admin', { replace: true })
  }

  if (!loading && userRole === 'Associate' && !isAssociatePage) {
    return <Navigate to="/admin/projects" replace />
  }

  const hasAccess = Boolean(user && !disabled && (isFullAdmin || userRole === 'Associate'))
  const initials = (user?.name || user?.displayName || user?.email || 'U')
    .split(/[\s@]+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (!loading && (error || !user || disabled || !hasAccess)) {
    return (
      <main className="admin-access-page">
        <section aria-labelledby="admin-access-title" className="admin-access-card" role="alert">
          <div className="admin-access-icon" aria-hidden="true">
            <i className={`fa-solid ${error ? 'fa-triangle-exclamation' : 'fa-lock'}`}></i>
          </div>
          <span className="admin-access-eyebrow">Startup Credit Admin</span>
          <h1 id="admin-access-title">
            {error
              ? 'We could not verify your access'
              : !user
                ? 'Sign in required'
                : disabled
                  ? 'This account is disabled'
                  : 'Admin access required'}
          </h1>
          <p className="admin-access-description">
            {error
              ? 'Your user profile could not be read. Check the Firestore rules deployment and try again.'
              : !user
                ? 'Sign in with your regular account to continue.'
                : disabled
                  ? 'This account has been disabled. Contact support if you believe this is a mistake.'
                  : 'This account does not currently have an admin role.'}
          </p>

          {user && !error && !disabled && (
            <div className="admin-access-diagnostics">
              <div>
                <span>Signed in as</span>
                <strong>{user.email || 'Unknown email'}</strong>
              </div>
              <div>
                <span>Current role</span>
                <strong>{userRole}</strong>
              </div>
              {/* <div>
                <span>Firebase project</span>
                <strong>{firebaseProjectId || 'Not configured'}</strong>
              </div>
              <div>
                <span>Profile document</span>
                <code>users/{user.uid}</code>
              </div> */}
              {!profileExists && (
                <p className="admin-access-profile-missing">
                  No profile document was found at this UID. The admin panel does not look up
                  profiles by email address.
                </p>
              )}
            </div>
          )}

          {!error && user && !disabled && !hasAccess && (
            <p className="admin-access-help">
              In this Firebase project, verify that the document ID is the UID shown above and
              that its <code>userRole</code> field is exactly <code>Admin</code>,{' '}
              <code>Super Admin</code>, or <code>Associate</code>. This page updates when that
              profile changes.
            </p>
          )}

          <div className="admin-access-actions">
            {!user ? (
              <button
                className="admin-link-button"
                type="button"
                onClick={() => openAuthModal('login')}
              >
                Go to sign in
              </button>
            ) : (
              <button className="admin-link-button" type="button" onClick={handleLogout}>
                Sign out
              </button>
            )}
            <button className="admin-link-button" type="button" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>



        </section>
      </main>
    )
  }

  return (
    <main className="admin-shell" style={!isSidebarOpen ? { display: 'block' } : {}}>
      {hasAccess && isSidebarOpen && (
        <aside className="admin-sidebar open">
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
            {NAV_ITEMS
              .filter((item) => isFullAdmin || [
                '/admin/project-inquiries',
                '/admin/projects',
                '/admin/business-associate-management',
              ].includes(item.to))
              .map((item) => (
                <NavLink className="admin-nav-link" key={item.to} to={item.to}>
                  <i className={`fa-solid ${item.icon}`} aria-hidden="true"></i>
                  {item.label}
                </NavLink>
              ))}
          </nav>
        </aside>
      )}

      <section className="admin-main">
        <header className="admin-topbar">
          {hasAccess && !isSidebarOpen ? (
            <button
              className="admin-icon-button"
              type="button"
              aria-label="Open menu"
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fa-solid fa-bars" aria-hidden="true"></i>
            </button>
          ) : <div style={{ width: '42px' }}></div>}

          <div className="admin-global-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input type="search" placeholder="Search anything..." aria-label="Search anything" />
          </div>

          {hasAccess && (
            <div className="admin-profile">
              <span className="admin-avatar">{initials}</span>
              <div>
                <strong>{user.name || user.displayName || user.email}</strong>
                <span>{userRole}</span>
              </div>
              <button
                className="admin-logout-button"
                type="button"
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                Logout
              </button>
            </div>
          )}
        </header>

        <div className="admin-content">
          <div className="admin-page-heading">
            <div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </div>

          {loading ? (
            <div className="admin-loader-container">
              <div className="admin-loader"></div>
              <span>Verifying admin access...</span>
            </div>
          ) : error ? (
            <div role="alert" className="admin-access-error">
              Could not verify your user profile. Please try again or contact an administrator.
            </div>
          ) : !user ? (
            <div className="admin-access-error">
              <strong>Sign in required.</strong> Sign in with your regular account to continue.
              <button className="admin-link-button" type="button" onClick={() => openAuthModal('login')}>
                Sign in
              </button>
            </div>
          ) : !hasAccess ? (
            <div className="admin-access-error">
              <strong>{disabled ? 'This account has been disabled.' : 'Admin access not active.'}</strong>{' '}
              {!disabled && <>This account has the &quot;{userRole}&quot; role. Contact a Super Admin if you need access.</>}
              <button className="admin-link-button" type="button" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          ) : children}
        </div>
      </section>
    </main>
  )
}

export default AdminShell
