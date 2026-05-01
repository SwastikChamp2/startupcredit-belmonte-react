import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminShell from './AdminShell'

const DUMMY_USERS = [
  {
    id: 'user-aarav-sharma',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    createdAt: '12 May 2024, 10:30 AM',
    status: 'Active',
  },
  {
    id: 'user-priya-nair',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    createdAt: '28 June 2024, 04:15 PM',
    status: 'Active',
  },
  {
    id: 'user-rohan-mehta',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@example.com',
    createdAt: '09 August 2024, 11:20 AM',
    status: 'Active',
  },
  {
    id: 'user-ananya-iyer',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@example.com',
    createdAt: '17 October 2024, 09:45 AM',
    status: 'Disabled',
  },
]

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function AdminUsers() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const [users, setUsers] = useState(DUMMY_USERS)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    const usersByStatus =
      statusFilter === 'All'
        ? users
        : users.filter((user) => user.status === statusFilter)

    if (!query) {
      return usersByStatus
    }

    return usersByStatus.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    )
  }, [searchTerm, statusFilter, users])

  const activeUsers = users.filter((user) => user.status === 'Active').length
  const disabledUsers = users.filter((user) => user.status === 'Disabled').length

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const disableUser = (userId) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, status: 'Disabled' } : user,
      ),
    )
  }

  const deleteUser = (userId) => {
    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId))
  }

  return (
    <AdminShell
      title="User Management"
      subtitle="Manage registered users and their account status."
    >
      <section className="admin-users-card">
        <div className="admin-users-toolbar">
          <div className="admin-user-tabs" aria-label="User status summary">
            <button
              className={statusFilter === 'All' ? 'active' : ''}
              onClick={() => setStatusFilter('All')}
              type="button"
            >
              All Users ({users.length})
            </button>
            <button
              className={statusFilter === 'Active' ? 'active' : ''}
              onClick={() => setStatusFilter('Active')}
              type="button"
            >
              Active ({activeUsers})
            </button>
            <button
              className={statusFilter === 'Disabled' ? 'active' : ''}
              onClick={() => setStatusFilter('Disabled')}
              type="button"
            >
              Disabled ({disabledUsers})
            </button>
          </div>

          <label className="admin-users-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input
              aria-label="Search users by name or email"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or email..."
              type="search"
              value={searchTerm}
            />
          </label>
        </div>

        <div className="admin-users-table-wrap">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Date Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-user-name">
                      <span>{getInitials(user.name)}</span>
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.createdAt}</td>
                  <td>
                    <span className={`admin-status ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-user-actions">
                      <button
                        disabled={user.status === 'Disabled'}
                        onClick={() => disableUser(user.id)}
                        type="button"
                      >
                        Disable
                      </button>
                      <button
                        className="danger"
                        onClick={() => deleteUser(user.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="admin-users-empty">
              <i className="fa-regular fa-user" aria-hidden="true"></i>
              <strong>No users found</strong>
              <span>Try searching with another name or email.</span>
            </div>
          )}
        </div>

        <footer className="admin-users-footer">
          Showing {filteredUsers.length} of {users.length} users
        </footer>
      </section>
    </AdminShell>
  )
}

export default AdminUsers
