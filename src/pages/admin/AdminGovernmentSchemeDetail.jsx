import { useState, useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminShell from './AdminShell'
import { mockGovernmentSchemes, GOVT_SCHEME_CATEGORIES, MINISTRIES } from './mockGovernmentSchemes'
import './admin.css'

function AdminGovernmentSchemeDetail() {
  const { schemeId } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const isEdit = schemeId !== 'new'
  
  const [activeTab, setActiveTab] = useState('Overview')
  const [formData, setFormData] = useState({
    name: '',
    fullTitle: '',
    slug: '',
    ministry: MINISTRIES[0],
    status: 'Published',
    order: 1,
    categories: [],
    shortDescription: '',
    highlights: [''],
    tags: [''],
    image: '',
    content: '',
    eligibilityCriteria: '',
    documents: [''],
    seoTitle: '',
    seoDescription: '',
  })

  useEffect(() => {
    if (isEdit) {
      const scheme = mockGovernmentSchemes.find(s => s.id === schemeId)
      if (scheme) {
        setFormData({
          ...formData,
          ...scheme,
          categories: scheme.categories || [],
          highlights: scheme.highlights || [''],
          tags: scheme.tags || [''],
          documents: scheme.documents || [''],
          seoTitle: scheme.seoTitle || scheme.name,
          seoDescription: scheme.seoDescription || scheme.shortDescription || '',
          content: scheme.sections?.map(s => `<h3>${s.title}</h3><p>${s.content}</p>`).join('') || '',
        })
      }
    }
  }, [schemeId, isEdit])

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

  const handleMultiSelect = (category) => {
    setFormData(prev => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
      return { ...prev, categories }
    })
  }

  const handleListChange = (listName, index, value) => {
    const newList = [...formData[listName]]
    newList[index] = value
    setFormData(prev => ({ ...prev, [listName]: newList }))
  }

  const addListItem = (listName) => {
    setFormData(prev => ({ ...prev, [listName]: [...prev[listName], ''] }))
  }

  const removeListItem = (listName, index) => {
    const newList = formData[listName].filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, [listName]: newList }))
  }

  const handleSave = () => {
    console.log('Saving scheme:', formData)
    navigate('/admin/government-schemes')
  }

  return (
    <AdminShell
      title={isEdit ? 'Edit Government Scheme' : 'Create New Government Scheme'}
      subtitle={isEdit ? `Update details for ${formData.name}` : 'Fill in the details to add a new government scheme.'}
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
            <h2>{formData.name || 'New Scheme'}</h2>
          </div>
          <div className="admin-service-detail-tabs">
            {['Overview', 'Ministry', 'Content', 'Eligibility', 'Documents', 'SEO', 'Settings'].map(tab => (
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
                  <label>Scheme Name *</label>
                  <input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. PMEGP Scheme" />
                </div>
                <div className="admin-form-group">
                  <label>Full Title</label>
                  <input name="fullTitle" value={formData.fullTitle} onChange={handleInputChange} placeholder="Full official name..." />
                </div>
                <div className="admin-form-group">
                  <label>Slug *</label>
                  <input name="slug" value={formData.slug} onChange={handleInputChange} placeholder="pmegp-scheme" />
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Status *</label>
                    <select name="status" value={formData.status} onChange={handleInputChange}>
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Categories (Select one or more)</label>
                  <div className="admin-multi-select-chips">
                    {GOVT_SCHEME_CATEGORIES.map(cat => (
                      <button 
                        key={cat}
                        type="button"
                        className={formData.categories.includes(cat) ? 'active' : ''}
                        onClick={() => handleMultiSelect(cat)}
                      >
                        {cat} {formData.categories.includes(cat) && <i className="fa-solid fa-xmark"></i>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Short Description</label>
                  <textarea name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} rows="3"></textarea>
                </div>
              </div>

              <div className="admin-form-side-grid">


                <div className="admin-form-section">
                  <h3>Key Benefits (Highlights)</h3>
                  <div className="highlights-list">
                    {formData.highlights.map((h, i) => (
                      <div key={i} className="highlight-item">
                        <input value={h} onChange={(e) => handleListChange('highlights', i, e.target.value)} />
                        <button onClick={() => removeListItem('highlights', i)}><i className="fa-solid fa-minus"></i></button>
                      </div>
                    ))}
                    <button className="add-highlight-btn" onClick={() => addListItem('highlights')}>+ Add More</button>
                  </div>
                </div>

                <div className="admin-form-section">
                  <h3>Scheme Tags</h3>
                  <div className="admin-multi-select-chips">
                    {formData.tags.map((tag, i) => (
                      <div key={i} className="tag-input-item">
                        <input value={tag} onChange={(e) => handleListChange('tags', i, e.target.value)} placeholder="Tag..." />
                        <button onClick={() => removeListItem('tags', i)}><i className="fa-solid fa-xmark"></i></button>
                      </div>
                    ))}
                    <button className="add-highlight-btn" onClick={() => addListItem('tags')}>+ Add Tag</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Ministry' && (
            <div className="admin-service-content-editor">
              <div className="admin-form-section">
                <h3>Ministry Information</h3>
                <div className="admin-form-group">
                  <label>Ministry Name</label>
                  <input 
                    name="ministry" 
                    value={formData.ministry} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Ministry of Micro, Small and Medium Enterprises" 
                  />
                  <p className="image-hint mt-2">Enter the full name of the governing ministry or department.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Content' && (
            <div className="admin-service-content-editor">
              <div className="editor-toolbar">
                <button><i className="fa-solid fa-bold"></i></button>
                <button><i className="fa-solid fa-italic"></i></button>
                <button><i className="fa-solid fa-link"></i></button>
              </div>
              <textarea 
                name="content"
                className="rich-content-textarea"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Detailed scheme description and nature of assistance..."
              ></textarea>
            </div>
          )}

          {activeTab === 'Eligibility' && (
            <div className="admin-service-content-editor">
              <textarea 
                name="eligibilityCriteria"
                className="rich-content-textarea"
                value={formData.eligibilityCriteria}
                onChange={handleInputChange}
                placeholder="Describe who is eligible for this scheme..."
              ></textarea>
            </div>
          )}

          {activeTab === 'Documents' && (
            <div className="admin-form-section">
              <h3>Required Documents</h3>
              <div className="highlights-list">
                {formData.documents.map((doc, i) => (
                  <div key={i} className="highlight-item">
                    <input value={doc} onChange={(e) => handleListChange('documents', i, e.target.value)} placeholder="e.g. Aadhar Card" />
                    <button onClick={() => removeListItem('documents', i)}><i className="fa-solid fa-minus"></i></button>
                  </div>
                ))}
                <button className="add-highlight-btn" onClick={() => addListItem('documents')}>+ Add Document</button>
              </div>
            </div>
          )}

          {activeTab === 'SEO' && (
            <div className="admin-service-seo-form">
              <div className="admin-form-group">
                <label>SEO Title</label>
                <input name="seoTitle" value={formData.seoTitle} onChange={handleInputChange} />
              </div>
              <div className="admin-form-group">
                <label>Meta Description</label>
                <textarea name="seoDescription" value={formData.seoDescription} onChange={handleInputChange} rows="4"></textarea>
              </div>
              <div className="google-preview">
                <h4>Google Search Preview</h4>
                <div className="preview-box">
                  <span className="preview-url">startupcredit.com › government-schemes › {formData.slug}</span>
                  <span className="preview-title">{formData.seoTitle || formData.name}</span>
                  <p className="preview-desc">{formData.seoDescription}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="admin-service-settings">
              <button className="delete-service-final-btn">
                <i className="fa-solid fa-trash"></i> Delete Scheme
              </button>
            </div>
          )}
        </div>

        <footer className="admin-service-detail-footer">
          <div className="quick-actions-btns">
            <button className="update-scheme-btn" onClick={handleSave}>
              <i className="fa-solid fa-rotate"></i> Update Scheme
            </button>
            <button className="preview-scheme-btn">
              <i className="fa-regular fa-eye"></i> Preview Scheme
            </button>
            <button className="delete-scheme-btn">
              <i className="fa-regular fa-trash-can"></i> Delete Scheme
            </button>
          </div>
        </footer>
      </div>
    </AdminShell>
  )
}

export default AdminGovernmentSchemeDetail
