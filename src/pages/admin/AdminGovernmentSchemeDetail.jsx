import { useState, useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminShell from './AdminShell'
import {
  fetchAdminScheme,
  fetchAdminSchemes,
  createAdminScheme,
  updateAdminScheme,
  deleteAdminScheme,
} from '../../services/adminDataApi'
import RichTextEditor from '../../components/RichTextEditor'
import './admin.css'

function AdminGovernmentSchemeDetail() {
  const { schemeId } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const isEdit = schemeId !== 'new'

  const [activeTab, setActiveTab] = useState('Overview')
  const [allCategories, setAllCategories] = useState([])
  const [categoryLookup, setCategoryLookup] = useState({ idToName: {}, nameToId: {} })
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    fullTitle: '',
    slug: '',
    status: 'Published',
    order: 1,
    categories: [],
    categoryId: '',
    highlights: [''],
    tags: [''],
    image: '',
    objective: '',
    benefits: '',
    beneficiary: '',
    eligibilityCriteria: '',
    description: '',
    content: '',
    documents: [''],
    sections: [],
    seoTitle: '',
    seoDescription: '',
  })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        if (isEdit) {
          const data = await fetchAdminScheme(schemeId)
          if (cancelled) return
          setAllCategories(data.categories)
          setCategoryLookup(data.categoryLookup)
          if (data.scheme) {
            setFormData((prev) => ({
              ...prev,
              ...data.scheme,
              highlights: data.scheme.highlights?.length ? data.scheme.highlights : (prev.highlights || ['']),
              tags: data.scheme.tags?.length ? data.scheme.tags : (prev.tags || ['']),
              documents: data.scheme.documents?.length ? data.scheme.documents : (prev.documents || ['']),
              seoTitle: data.scheme.seoTitle || data.scheme.name || prev.seoTitle,
              seoDescription: data.scheme.seoDescription || data.scheme.description || prev.seoDescription,
            }))
          }
        } else {
          const data = await fetchAdminSchemes()
          if (cancelled) return
          setAllCategories(data.categories)
          setCategoryLookup(data.categoryLookup)
        }
      } catch (err) {
        if (!cancelled) setSaveError(err?.message || 'Could not load scheme.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [schemeId, isEdit])

  const categoryNames = (allCategories || []).map((c) => c.name)

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
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/\s/g, '-')
        
        if (!prev.seoTitle || prev.seoTitle === prev.name) {
          updates.seoTitle = value
        }
      }

      if (name === 'description') {
        if (!prev.seoDescription || prev.seoDescription === prev.description) {
          updates.seoDescription = value
        }
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

  const REQUIRED_FIELDS = [
    'name', 
    'slug', 
    'objective', 
    'benefits', 
    'beneficiary', 
    'eligibilityCriteria', 
    'description'
  ]
  const isFormValid = () => REQUIRED_FIELDS.every(key => !!formData[key])

  const handleNextOrSave = async () => {
    setSaveError('')
    
    if (!isFormValid()) {
      // Find which tab the first missing field is in and go there
      if (!formData.name || !formData.slug) {
        setActiveTab('Overview')
      } else if (!formData.objective) {
        setActiveTab('Objective')
      } else if (!formData.benefits) {
        setActiveTab('Benefits')
      } else if (!formData.beneficiary) {
        setActiveTab('Beneficiary')
      } else if (!formData.eligibilityCriteria) {
        setActiveTab('Eligibility')
      } else if (!formData.description) {
        setActiveTab('Description')
      }
      return
    }

    setSaving(true)
    try {
      if (isEdit) {
        await updateAdminScheme(schemeId, formData, categoryLookup)
      } else {
        await createAdminScheme(formData, categoryLookup)
      }
      navigate('/admin/government-schemes')
    } catch (err) {
      setSaveError(err?.message || 'Could not save scheme.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!isEdit) return
    if (!window.confirm('Delete this scheme? This cannot be undone.')) return
    try {
      await deleteAdminScheme(schemeId)
      navigate('/admin/government-schemes')
    } catch (err) {
      setSaveError(err?.message || 'Could not delete scheme.')
    }
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
            {['Overview', 'Objective', 'Benefits', 'Beneficiary', 'Eligibility', 'Description', 'SEO', 'Settings'].map(tab => (
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
            <>
              <div className="admin-service-overview-grid">
                <div className="admin-form-section">
                  <h3>Basic Information</h3>
                  <div className="admin-form-group">
                    <label>Scheme Name *</label>
                    <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter Scheme Name" />
                  </div>
                  <div className="admin-form-group">
                    <label>Full Title</label>
                    <input name="fullTitle" value={formData.fullTitle} onChange={handleInputChange} placeholder="Full official name..." />
                  </div>
                  <div className="admin-form-group">
                    <label>Slug *</label>
                    <input name="slug" value={formData.slug} onChange={handleInputChange} placeholder="enter-scheme-slug" />
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
                      {(categoryNames || []).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={formData.categories.includes(cat) ? 'active' : ''}
                          onClick={() => handleMultiSelect(cat)}
                        >
                          {cat} {formData.categories.includes(cat) && <i className="fa-solid fa-xmark"></i>}
                        </button>
                      ))}
                      {categoryNames.length === 0 && (
                        <span style={{ fontSize: 13, color: '#94a3b8' }}>No categories yet — add some on the management page.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-form-side-grid">
                  <div className="admin-form-section">
                    <h3>Key Benefits (Highlights)</h3>
                    <div className="highlights-list">
                      {(formData.highlights || []).map((h, i) => (
                        <div key={i} className="highlight-item">
                          <input value={h} onChange={(e) => handleListChange('highlights', i, e.target.value)} />
                          <button onClick={() => removeListItem('highlights', i)}><i className="fa-solid fa-minus"></i></button>
                        </div>
                      ))}
                      <button className="add-highlight-btn" onClick={() => addListItem('highlights')}>+ Add More</button>
                    </div>
                  </div>

                  <div className="admin-form-section">
                    <h3>Required Documents</h3>
                    <div className="highlights-list">
                      {(formData.documents || []).map((doc, i) => (
                        <div key={i} className="highlight-item">
                          <input value={doc} onChange={(e) => handleListChange('documents', i, e.target.value)} placeholder="Aadhar Card, PAN, etc." />
                          <button onClick={() => removeListItem('documents', i)}><i className="fa-solid fa-minus"></i></button>
                        </div>
                      ))}
                      <button className="add-highlight-btn" onClick={() => addListItem('documents')}>+ Add Document</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}


          {activeTab === 'Objective' && (
            <div className="admin-service-content-editor">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px', color: '#475569' }}>
                Objective *
              </label>
              <RichTextEditor
                name="objective"
                value={formData.objective}
                onChange={handleInputChange}
                placeholder="What is the main objective of this scheme? (HTML supported)"
              />
            </div>
          )}

          {activeTab === 'Benefits' && (
            <div className="admin-service-content-editor">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px', color: '#475569' }}>
                Benefits *
              </label>
              <RichTextEditor
                name="benefits"
                value={formData.benefits}
                onChange={handleInputChange}
                placeholder="Describe the nature of assistance and benefits provided... (HTML supported)"
              />
            </div>
          )}

          {activeTab === 'Beneficiary' && (
            <div className="admin-service-content-editor">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px', color: '#475569' }}>
                Beneficiary *
              </label>
              <RichTextEditor
                name="beneficiary"
                value={formData.beneficiary}
                onChange={handleInputChange}
                placeholder="Who are the primary beneficiaries of this scheme? (HTML supported)"
              />
            </div>
          )}

          {activeTab === 'Eligibility' && (
            <div className="admin-service-content-editor">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px', color: '#475569' }}>
                Eligibility Criteria *
              </label>
              <RichTextEditor
                name="eligibilityCriteria"
                value={formData.eligibilityCriteria}
                onChange={handleInputChange}
                placeholder="Describe the eligibility criteria in detail... (HTML supported)"
              />
            </div>
          )}

          {activeTab === 'Description' && (
            <div className="admin-service-content-editor">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px', color: '#475569' }}>
                Full Description *
              </label>
              <RichTextEditor
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Full description of the scheme and any additional details... (HTML supported)"
              />
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
              <button
                className="delete-service-final-btn"
                type="button"
                disabled={!isEdit}
                onClick={handleDelete}
              >
                <i className="fa-solid fa-trash"></i> Delete Scheme
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="admin-loader-container">
            <div className="admin-loader"></div>
            <span>Loading scheme details...</span>
          </div>
        )}
        {saveError && (
          <div style={{ padding: '10px 16px', margin: '0 18px', color: '#b91c1c', background: '#fef2f2', borderRadius: 8, fontSize: 13 }}>
            {saveError}
          </div>
        )}

        <footer className="admin-service-detail-footer">
          <div className="quick-actions-btns">
            <button 
              className="update-scheme-btn" 
              onClick={handleNextOrSave} 
              disabled={saving || loading}
            >
              {saving ? (
                <><i className="fa-solid fa-rotate"></i> Saving…</>
              ) : !isFormValid() ? (
                'Next'
              ) : isEdit ? (
                <><i className="fa-solid fa-floppy-disk"></i> Save</>
              ) : (
                <><i className="fa-solid fa-plus"></i> Create</>
              )}
            </button>
            {isEdit && (
              <button
                type="button"
                className="delete-scheme-btn"
                onClick={handleDelete}
              >
                <i className="fa-regular fa-trash-can"></i> Delete Scheme
              </button>
            )}
          </div>
        </footer>
      </div>
    </AdminShell>
  )
}

export default AdminGovernmentSchemeDetail
