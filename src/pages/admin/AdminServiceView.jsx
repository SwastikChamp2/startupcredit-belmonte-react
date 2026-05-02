import { useState, useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminShell from './AdminShell'
import { mockServices } from './mockServices'
import './admin.css'

function AdminServiceView() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  
  const [service, setService] = useState(null)

  useEffect(() => {
    const foundService = mockServices.find(s => s.id === serviceId)
    if (foundService) {
      setService(foundService)
    }
  }, [serviceId])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (!service) {
    return (
      <AdminShell title="Service Details" subtitle="Loading...">
        <div style={{ padding: '20px' }}>Loading or Service not found...</div>
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
            <div dangerouslySetInnerHTML={{ __html: service.content || 'No content provided.' }} />
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
