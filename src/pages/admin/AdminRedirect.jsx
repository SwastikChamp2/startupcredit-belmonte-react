import { Navigate } from 'react-router-dom'

function AdminRedirect() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <Navigate to="/admin/users" replace />
}

export default AdminRedirect
