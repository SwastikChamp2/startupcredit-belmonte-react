import { useState, useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminShell from './AdminShell'
import { fetchAdminScheme } from '../../services/adminDataApi'
import './admin.css'

function AdminGovernmentSchemeView() {
  const { schemeId } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'

  const [scheme, setScheme] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchAdminScheme(schemeId)
      .then((data) => {
        if (!cancelled) setScheme(data.scheme)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Could not load scheme.')
      })
    return () => {
      cancelled = true
    }
  }, [schemeId])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (!scheme) {
    return (
      <AdminShell title="Government Scheme Details" subtitle={error ? 'Error' : 'Loading...'}>
        <div style={{ padding: '20px' }}>{error || 'Loading scheme from database…'}</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      title={`View Scheme: ${scheme.name}`}
      subtitle="Read-only view of government scheme details."
    >
      <div className="admin-detail-page-actions">
        <button
          className="admin-link-button secondary"
          onClick={() => navigate(-1)}
          type="button"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          Back
        </button>
      </div>
      <div className="admin-service-detail-container">
        <header className="admin-service-detail-header">
          <div className="admin-service-title-info">
            <h2>{scheme.name}</h2>
            <span className={`status-badge ${scheme.status.toLowerCase()}`}>{scheme.status}</span>
          </div>
        </header>

        <div className="admin-service-detail-content" style={{ padding: '20px' }}>
          <div className="admin-form-section">
            <h3>Basic Information</h3>
            <p><strong>Name:</strong> {scheme.name}</p>
            <p><strong>Full Title:</strong> {scheme.fullTitle}</p>
            <p><strong>Slug:</strong> {scheme.slug}</p>
            <p><strong>Ministry:</strong> {scheme.ministry}</p>
            <p><strong>Categories:</strong> {scheme.categories?.join(', ')}</p>
            <p><strong>Short Description:</strong> {scheme.shortDescription}</p>
          </div>

          <div className="admin-form-section" style={{ marginTop: '20px' }}>
            <h3>Highlights</h3>
            <ul>
              {scheme.highlights && scheme.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>

          <div className="admin-form-section" style={{ marginTop: '20px' }}>
            <h3>Tags</h3>
            <p>{scheme.tags?.join(', ')}</p>
          </div>

          <div className="admin-form-section" style={{ marginTop: '20px' }}>
            <h3>Documents Required</h3>
            <ul>
              {scheme.documents && scheme.documents.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="admin-service-detail-footer">
          <button className="save-changes-btn" onClick={() => navigate(`/admin/government-schemes/${scheme.id}`)}>
             Edit Scheme
          </button>
        </footer>
      </div>
    </AdminShell>
  )
}

export default AdminGovernmentSchemeView
