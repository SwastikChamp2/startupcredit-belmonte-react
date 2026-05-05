import { useState, useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminShell from './AdminShell'
import { mockServices, SERVICE_CATEGORIES } from './mockServices'
import './admin.css'

function AdminServiceDetail() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const isEdit = serviceId !== 'new'
  
  const [activeTab, setActiveTab] = useState('Overview')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: SERVICE_CATEGORIES[0],
    status: 'Published',
    shortDescription: '',
    order: 1,
    highlights: [''],
    image: '',
    publishedOn: new Date().toISOString().split('T')[0],
    visibility: 'Public',
    content: '',
    seoTitle: '',
    seoDescription: '',
  })

  useEffect(() => {
    if (isEdit) {
      const service = mockServices.find(s => s.id === serviceId)
      if (service) {
        setFormData({
          ...formData,
          ...service,
          highlights: service.highlights || [''],
          seoTitle: service.seoTitle || service.name,
          seoDescription: service.seoDescription || service.shortDescription,
        })
      }
    }
  }, [serviceId, isEdit])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updates = { [name]: value }
      
      if (name === 'name') {
        updates.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '') // remove special chars
          .replace(/\s+/g, ' ')        // replace multiple spaces with single space
          .trim()                      // remove leading/trailing spaces
          .replace(/\s/g, '-')         // replace spaces with hyphens
      }

      return { ...prev, ...updates }
    })
  }

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...formData.highlights]
    newHighlights[index] = value
    setFormData(prev => ({ ...prev, highlights: newHighlights }))
  }

  const addHighlight = () => {
    setFormData(prev => ({ ...prev, highlights: [...prev.highlights, ''] }))
  }

  const removeHighlight = (index) => {
    const newHighlights = formData.highlights.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, highlights: newHighlights }))
  }

  const handleSave = () => {
    console.log('Saving service:', formData)
    // In a real app, call API here
    navigate('/admin/services')
  }

  return (
    <AdminShell
      title={isEdit ? 'Edit Service' : 'Create New Service'}
      subtitle={isEdit ? `Update details for ${formData.name}` : 'Fill in the details to add a new service to the platform.'}
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
            <h2>{formData.name || 'New Service'}</h2>
          </div>
          <div className="admin-service-detail-tabs">
            {['Overview', 'Content', 'Images', 'SEO', 'Settings'].map(tab => (
              <button 
                key={tab}
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <div className="admin-service-detail-content">
          {activeTab === 'Overview' && (
            <div className="admin-service-overview-grid">
              <div className="admin-form-section">
                <h3>Basic Information</h3>
                <div className="admin-form-group">
                  <label>Service Name</label>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Startup India Registration"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Slug</label>
                  <div className="slug-input-wrapper">
                    <input 
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="startup-india-registration"
                    />
                    <button className="copy-slug-btn"><i className="fa-regular fa-copy"></i></button>
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange}>
                      {SERVICE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange}>
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>Short Description</label>
                  <textarea 
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="A brief summary of the service..."
                  ></textarea>
                  <span className="char-count">{formData.shortDescription.length} / 160</span>
                </div>
                <div className="admin-form-group">
                  <label>Display Order</label>
                  <input 
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="admin-form-section">
                <h3>Service Highlights</h3>
                <div className="highlights-list">
                  {formData.highlights.map((h, i) => (
                    <div key={i} className="highlight-item">
                      <i className="fa-solid fa-grip-vertical"></i>
                      <input 
                        value={h}
                        onChange={(e) => handleHighlightChange(i, e.target.value)}
                        placeholder="Key benefit or feature..."
                      />
                      <button onClick={() => removeHighlight(i)}><i className="fa-solid fa-circle-minus"></i></button>
                    </div>
                  ))}
                  <button className="add-highlight-btn" onClick={addHighlight}>
                    <i className="fa-solid fa-plus"></i> Add Highlight
                  </button>
                </div>
              </div>

              <div className="admin-form-section">
                <h3>Service Image</h3>
                <div className="admin-image-upload-box">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="image-placeholder">
                      <i className="fa-regular fa-image"></i>
                      <span>No image selected</span>
                    </div>
                  )}
                  <label className="change-image-btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    {formData.image ? 'Change Image' : 'Add Image'}
                    <input 
                      type="file" 
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const imageUrl = URL.createObjectURL(file);
                          setFormData(prev => ({ ...prev, image: imageUrl }));
                        }
                      }}
                    />
                  </label>
                  <p className="image-hint">Recommended size: 1200x675px</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Content' && (
            <div className="admin-service-content-editor">
              <div className="editor-toolbar">
                <button><i className="fa-solid fa-bold"></i></button>
                <button><i className="fa-solid fa-italic"></i></button>
                <button><i className="fa-solid fa-list-ul"></i></button>
                <button><i className="fa-solid fa-list-ol"></i></button>
                <button><i className="fa-solid fa-link"></i></button>
                <button><i className="fa-solid fa-heading"></i></button>
              </div>
              <textarea 
                name="content"
                className="rich-content-textarea"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter detailed service content here (HTML supported)..."
              ></textarea>
            </div>
          )}

          {activeTab === 'SEO' && (
            <div className="admin-service-seo-form">
              <div className="admin-form-group">
                <label>SEO Title</label>
                <input 
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  placeholder="Meta title for search engines"
                />
              </div>
              <div className="admin-form-group">
                <label>Meta Description</label>
                <textarea 
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Brief description for search results..."
                ></textarea>
              </div>
              <div className="google-preview">
                <h4>Google Search Preview</h4>
                <div className="preview-box">
                  <span className="preview-url">startupcredit.com › service › {formData.slug}</span>
                  <span className="preview-title">{formData.seoTitle || formData.name || 'Service Title'}</span>
                  <p className="preview-desc">{formData.seoDescription || 'No description provided. Google will display a snippet from your content.'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="admin-service-settings">
              <div className="admin-form-section">
                <h3>Danger Zone</h3>
                <p>Once you delete a service, there is no going back. Please be certain.</p>
                <button className="delete-service-final-btn">
                  <i className="fa-solid fa-trash"></i> Delete Service
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="admin-service-detail-footer">
          <button className="cancel-btn" onClick={() => navigate('/admin/services')}>Cancel</button>
          <button className="save-changes-btn" onClick={handleSave}>Save Changes</button>
        </footer>
      </div>
    </AdminShell>
  )
}

export default AdminServiceDetail
