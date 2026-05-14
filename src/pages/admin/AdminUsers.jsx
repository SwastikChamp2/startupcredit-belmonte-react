import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import AdminPagination from './AdminPagination'
import useAdminPagination from './useAdminPagination'
import {
  adaptUserForAdmin,
  setAdminUserDisabled,
  deleteAdminUser,
} from '../../services/adminDataApi'
import { useFirestoreCollection } from '../../hooks/useFirestoreSnapshot'

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function AdminUsers() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const [errorMsg, setErrorMsg] = useState('')
  const [actionPending, setActionPending] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [userToDelete, setUserToDelete] = useState(null)
  const [sortOrder, setSortOrder] = useState('desc')

  const { items: users, loading, error: liveError } = useFirestoreCollection(
    'users',
    adaptUserForAdmin
  )

  const parseDate = (dateStr) => {
    if (!dateStr || dateStr === '—') return 0
    // Try to parse the DD-MMM-YYYY HH:mm format or similar from toLocaleString
    const parts = dateStr.split(/[\s,-]+/)
    if (parts.length >= 3) {
      return new Date(dateStr).getTime() || 0
    }
    return 0
  }

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    const usersByStatus =
      statusFilter === 'All'
        ? users
        : users.filter((user) => user.status === statusFilter)

    let result = query 
      ? usersByStatus.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query),
        )
      : usersByStatus

    return result.sort((a, b) => {
      const timeA = parseDate(a.createdAt)
      const timeB = parseDate(b.createdAt)
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
    })
  }, [searchTerm, statusFilter, users, sortOrder])

  const usersPagination = useAdminPagination(filteredUsers)

  const activeUsers = users.filter((user) => user.status === 'Active').length
  const disabledUsers = users.filter((user) => user.status === 'Disabled').length

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const toggleDisabled = async (user) => {
    setActionPending(user.id)
    setErrorMsg('')
    try {
      await setAdminUserDisabled(user.id, user.status !== 'Disabled')
      // Live snapshot listener picks up the change.
    } catch (err) {
      setErrorMsg(err?.message || 'Could not update user.')
    } finally {
      setActionPending(null)
    }
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    setActionPending(userToDelete.id)
    setErrorMsg('')
    try {
      await deleteAdminUser(userToDelete.id)
      setUserToDelete(null)
      // Live snapshot will drop the user automatically.
    } catch (err) {
      setErrorMsg(err?.message || 'Could not delete user.')
    } finally {
      setActionPending(null)
    }
  }

  return (
    <AdminShell
      title="User Management"
      subtitle="Manage registered users and their account status."
    >
      <section className="admin-users-card">
        {(errorMsg || liveError) && (
          <div style={{ padding: '12px 18px', margin: '12px 18px 0', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
            {errorMsg || liveError?.message || 'Could not load users.'}
          </div>
        )}
        {loading && (
          <div className="admin-loader-container">
            <div className="admin-loader"></div>
            <span>Loading users...</span>
          </div>
        )}

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
                <th>
                  Date Created
                  <button
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
                    aria-label="Toggle sort order"
                    type="button"
                  >
                    <i className={`fa-solid fa-arrow-${sortOrder === 'desc' ? 'down' : 'up'}`} aria-hidden="true" style={{ color: 'var(--text-light)' }}></i>
                  </button>
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersPagination.paginatedItems.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-user-name">
                      <span>{getInitials(user.name)}</span>
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.createdAt || '—'}</td>
                  <td>
                    <span className={`admin-status ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-user-actions">
                      <button
                        disabled={actionPending === user.id}
                        onClick={() => toggleDisabled(user)}
                        type="button"
                      >
                        {user.status === 'Disabled' ? 'Enable' : 'Disable'}
                      </button>
                      <button
                        className="danger"
                        disabled={actionPending === user.id}
                        onClick={() => setUserToDelete(user)}
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

          {!loading && filteredUsers.length === 0 && (
            <div className="admin-users-empty">
              <i className="fa-regular fa-user" aria-hidden="true"></i>
              <strong>No users found</strong>
              <span>
                {users.length === 0
                  ? 'No accounts have been created yet.'
                  : 'Try searching with another name or email.'}
              </span>
            </div>
          )}
        </div>

        <AdminPagination
          {...usersPagination}
          itemLabel="users"
          totalRecords={users.length}
        />
      </section>

      {userToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 420, width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 18, color: '#0f172a' }}>Delete user</h3>
            <p style={{ margin: '0 0 24px 0', color: '#475569', fontSize: 14, lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{userToDelete.email}</strong>? This permanently
              removes the account from Firestore and cannot be undone. Consider disabling instead.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setUserToDelete(null)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#475569', fontWeight: 500 }}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{ padding: '8px 16px', background: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#fff', fontWeight: 500 }}
                type="button"
                disabled={actionPending === userToDelete.id}
              >
                {actionPending === userToDelete.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

export default AdminUsers
