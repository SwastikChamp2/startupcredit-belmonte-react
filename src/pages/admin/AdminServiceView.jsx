import { useState, useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminShell from './AdminShell'
import { fetchAdminService } from '../../services/adminDataApi'
import './admin.css'

function AdminServiceView() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'

  const [service, setService] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchAdminService(serviceId)
      .then((data) => {
        if (!cancelled) setService(data.service)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Could not load service.')
      })
    return () => {
      cancelled = true
    }
  }, [serviceId])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (!service) {
    return (
      <AdminShell title="Service Details" subtitle={error ? 'Error' : 'Loading...'}>
        <div style={{ padding: '20px' }}>{error || 'Loading service from database…'}</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      title={`View Service: ${service.name}`}
      subtitle="Read-only view of service details."
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
            <h2>{service.name}</h2>
            <span className={`status-badge ${service.status.toLowerCase()}`}>{service.status}</span>
          </div>
        </header>

        <div className="admin-service-detail-content" style={{ padding: '20px' }}>
          <div className="admin-form-section">
            <h3>Basic Information</h3>
            <p><strong>Name:</strong> {service.name}</p>
            <p><strong>Slug:</strong> {service.slug}</p>
            <p><strong>Category:</strong> {service.category}</p>
            <p><strong>Short Description:</strong> {service.shortDescription}</p>
            <p><strong>Order:</strong> {service.order}</p>
          </div>

          <div className="admin-form-section" style={{ marginTop: '20px' }}>
            <h3>Service Highlights</h3>
            <ul>
              {service.highlights && service.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>

          <div className="admin-form-section" style={{ marginTop: '20px' }}>
            <h3>Content</h3>
            <div className="rich-text-render" dangerouslySetInnerHTML={{ __html: service.content || 'No content provided.' }} />
          </div>

          {service.ourApproach && (
            <div className="admin-form-section" style={{ marginTop: '20px' }}>
              <h3>Our Approach</h3>
              <div className="rich-text-render" dangerouslySetInnerHTML={{ __html: service.ourApproach }} />
            </div>
          )}

          {service.faqs && service.faqs.length > 0 && (
            <div className="admin-form-section" style={{ marginTop: '20px' }}>
              <h3>Frequently Asked Questions</h3>
              <div className="admin-faqs-list">
                {service.faqs.map((faq, i) => (
                  <div key={i} className="admin-faq-item" style={{ marginBottom: '10px' }}>
                    <p><strong>Q: {faq.question}</strong></p>
                    <p>A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="admin-form-section" style={{ marginTop: '20px' }}>
            <h3>Images</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <p>Main Image</p>
                <img src={service.image} alt="Main" style={{ width: '200px', borderRadius: '8px' }} />
              </div>
              {service.featureImage1 && (
                <div>
                  <p>Feature 1</p>
                  <img src={service.featureImage1} alt="Feature 1" style={{ width: '150px', borderRadius: '8px' }} />
                </div>
              )}
              {service.featureImage2 && (
                <div>
                  <p>Feature 2</p>
                  <img src={service.featureImage2} alt="Feature 2" style={{ width: '150px', borderRadius: '8px' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="admin-service-detail-footer">
          <button className="save-changes-btn" onClick={() => navigate(`/admin/services/${service.id}`)}>
             Edit Service
          </button>
        </footer>
      </div>
    </AdminShell>
  )
}

export default AdminServiceView
