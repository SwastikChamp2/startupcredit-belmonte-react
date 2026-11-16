import { Navigate } from 'react-router-dom'

function AdminRedirect() {
  return <Navigate to="/admin/users" replace />
}

export default AdminRedirect
