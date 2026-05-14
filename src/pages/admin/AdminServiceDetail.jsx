import { useState, useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminShell from './AdminShell'
import {
  fetchAdminService,
  fetchAdminServices,
  createAdminService,
  updateAdminService,
  deleteAdminService,
  uploadAdminFile,
} from '../../services/adminDataApi'
import RichTextEditor from '../../components/RichTextEditor'
import './admin.css'

function AdminServiceDetail() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const isEdit = serviceId !== 'new'

  const [activeTab, setActiveTab] = useState('Overview')
  const [sections, setSections] = useState([])
  const [sectionLookup, setSectionLookup] = useState({ idToTitle: {}, titleToId: {} })
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    status: 'Published',
    shortDescription: '',
    order: 1,
    highlights: [''],
    image: '',
    publishedOn: new Date().toISOString().split('T')[0],
    visibility: 'Public',
    content: '',
    ourApproach: '',
    faqs: [],
    featureImage1: '',
    featureImage2: '',
    seoTitle: '',
    seoDescription: '',
    sources: [],
  })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        if (isEdit) {
          const data = await fetchAdminService(serviceId)
          if (cancelled) return
          setSections(data.sections)
          setSectionLookup(data.sectionLookup)
          if (data.service) {
            setFormData((prev) => ({
              ...prev,
              ...data.service,
              highlights: data.service.highlights?.length ? data.service.highlights : [''],
              seoTitle: data.service.seoTitle || data.service.name,
              seoDescription: data.service.seoDescription || data.service.shortDescription,
            }))
          }
        } else {
          const data = await fetchAdminServices()
          if (cancelled) return
          setSections(data.sections)
          setSectionLookup(data.sectionLookup)
          if (data.sections.length > 0) {
            setFormData((prev) => ({ ...prev, category: data.sections[0].title }))
          }
        }
      } catch (err) {
        if (!cancelled) setSaveError(err?.message || 'Could not load service.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
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
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/\s/g, '-')
        
        // Auto-sync SEO Title if it matches the old name or is empty
        if (!prev.seoTitle || prev.seoTitle === prev.name) {
          updates.seoTitle = value
        }
      }

      if (name === 'shortDescription') {
        // Auto-sync SEO Description if it matches old shortDesc or is empty
        if (!prev.seoDescription || prev.seoDescription === prev.shortDescription) {
          updates.seoDescription = value
        }
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

  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...formData.faqs]
    newFaqs[index] = { ...newFaqs[index], [field]: value }
    setFormData(prev => ({ ...prev, faqs: newFaqs }))
  }

  const addFaq = () => {
    setFormData(prev => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] }))
  }

  const removeFaq = (index) => {
    const newFaqs = formData.faqs.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, faqs: newFaqs }))
  }
  
  const addSource = (type = 'link') => {
    setFormData(prev => ({ 
      ...prev, 
      sources: [...prev.sources, { title: '', url: '', type }] 
    }))
  }

  const removeSource = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      sources: prev.sources.filter((_, i) => i !== index) 
    }))
  }

  const handleSourceChange = (index, field, value) => {
    setFormData(prev => {
      const newSources = [...prev.sources]
      newSources[index] = { ...newSources[index], [field]: value }
      return { ...prev, sources: newSources }
    })
  }

  const handleSourceFileUpload = async (index, file) => {
    try {
      setImageUploading(true);
      const uploaded = await uploadAdminFile(file, 'startupcredit/sources');
      
      setFormData(prev => {
        const newSources = [...prev.sources];
        newSources[index] = { 
          ...newSources[index], 
          url: uploaded.url, 
          title: newSources[index].title || file.name 
        };
        return { ...prev, sources: newSources };
      });
    } catch (err) {
      console.error('Source upload error:', err);
    } finally {
      setImageUploading(false);
    }
  }

  const handleImageChange = async (file, field = 'image') => {
    if (!file) return;
    setImageUploading(true);
    setSaveError('');
    try {
      console.log(`Uploading ${field} to Cloudinary...`);
      const uploaded = await uploadAdminFile(file, 'startupcredit/services');
      
      if (!uploaded || !uploaded.url) {
        throw new Error('Upload failed: No URL returned from Cloudinary');
      }

      setFormData(prev => ({ 
        ...prev, 
        [field]: uploaded.url 
      }));
      
      console.log(`Successfully uploaded ${field}:`, uploaded.url);
    } catch (err) {
      console.error(`Upload error for ${field}:`, err);
      setSaveError(err?.message || 'Could not upload image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const REQUIRED_FIELDS = ['name', 'slug', 'category', 'shortDescription', 'content', 'image']
  const isFormValid = () => REQUIRED_FIELDS.every(key => !!formData[key])

  const handleNextOrSave = async () => {
    setSaveError('')
    
    if (!isFormValid()) {
      // Find which tab the first missing field is in and go there
      if (!formData.name || !formData.slug || !formData.category || !formData.shortDescription) {
        setActiveTab('Overview')
      } else if (!formData.content) {
        setActiveTab('Content')
      } else if (!formData.image) {
        setActiveTab('Images')
      }
      return
    }

    // For new services, enforce stepping through to SEO tab
    if (!isEdit && activeTab !== 'SEO') {
      const tabs = ['Overview', 'Content', 'Approach', 'Images', 'FAQs', 'SEO']
      const currentIndex = tabs.indexOf(activeTab)
      if (currentIndex !== -1 && currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1])
        return
      }
    }

    setSaving(true)
    try {
      if (isEdit) {
        await updateAdminService(serviceId, formData, sectionLookup)
      } else {
        await createAdminService(formData, sectionLookup)
      }
      navigate('/admin/services')
    } catch (err) {
      setSaveError(err?.message || 'Could not save service.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!isEdit) return
    if (!window.confirm('Delete this service? This cannot be undone.')) return
    try {
      await deleteAdminService(serviceId)
      navigate('/admin/services')
    } catch (err) {
      setSaveError(err?.message || 'Could not delete service.')
    }
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
            {['Overview', 'Content', 'Approach', 'Images', 'FAQs', 'Sources', 'SEO', 'Settings']
              .filter(tab => isEdit || tab !== 'Settings')
              .map(tab => (
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
                  <label>Service Name *</label>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter Service Name"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Slug *</label>
                  <div className="slug-input-wrapper">
                    <input 
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="enter-service-slug"
                    />
                    <button className="copy-slug-btn"><i className="fa-regular fa-copy"></i></button>
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Category *</label>
                    <select name="category" value={formData.category} onChange={handleInputChange}>
                      {sections.map((section) => (
                        <option key={section.id} value={section.title}>{section.title}</option>
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
                  <label>Short Description *</label>
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
            </div>
          )}

          {activeTab === 'Images' && (
            <div className="admin-images-grid">
              <div className="admin-form-section">
                <h3>Main Service Image <span style={{ color: '#ef4444' }}>*</span></h3>
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
                    {imageUploading ? 'Uploading…' : formData.image ? 'Change Image' : 'Add Image'}
                    <input 
                      type="file" 
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageChange(e.target.files[0], 'image')}
                      disabled={imageUploading}
                    />
                  </label>
                  <p className="image-hint">Recommended size: 1200x675px</p>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-section">
                  <h3>Feature Image 1</h3>
                  <div className="admin-image-upload-box small-preview">
                    {formData.featureImage1 ? (
                      <img src={formData.featureImage1} alt="Preview 1" className="image-preview" />
                    ) : (
                      <div className="image-placeholder">
                        <i className="fa-regular fa-image"></i>
                        <span>No image</span>
                      </div>
                    )}
                    <label className="change-image-btn">
                      {imageUploading ? '…' : formData.featureImage1 ? 'Change' : 'Add'}
                      <input 
                        type="file" 
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageChange(e.target.files[0], 'featureImage1')}
                        disabled={imageUploading}
                      />
                    </label>
                  </div>
                </div>
                <div className="admin-form-section">
                  <h3>Feature Image 2</h3>
                  <div className="admin-image-upload-box small-preview">
                    {formData.featureImage2 ? (
                      <img src={formData.featureImage2} alt="Preview 2" className="image-preview" />
                    ) : (
                      <div className="image-placeholder">
                        <i className="fa-regular fa-image"></i>
                        <span>No image</span>
                      </div>
                    )}
                    <label className="change-image-btn">
                      {imageUploading ? '…' : formData.featureImage2 ? 'Change' : 'Add'}
                      <input 
                        type="file" 
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageChange(e.target.files[0], 'featureImage2')}
                        disabled={imageUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Content' && (
            <div className="admin-service-content-editor">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px', color: '#475569' }}>
                Service Content *
              </label>
              <RichTextEditor
                name="content"
                value={formData.content}
                onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                placeholder="Enter detailed service content here (HTML supported)..."
              />
            </div>
          )}

          {activeTab === 'Approach' && (
            <div className="admin-service-content-editor">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px', color: '#475569' }}>
                Our Approach
              </label>
              <RichTextEditor
                name="ourApproach"
                value={formData.ourApproach}
                onChange={(val) => setFormData(prev => ({ ...prev, ourApproach: val }))}
                placeholder="Describe your approach for this service..."
              />
            </div>
          )}

          {activeTab === 'FAQs' && (
            <div className="admin-form-section">
              <h3>Frequently Asked Questions</h3>
              <div className="admin-faqs-list">
                {formData.faqs.map((faq, i) => (
                  <div key={i} className="admin-faq-item">
                    <div className="admin-faq-header">
                      <span>Question {i + 1}</span>
                      <button type="button" onClick={() => removeFaq(i)} className="remove-item-btn"><i className="fa-solid fa-trash"></i></button>
                    </div>
                    <input 
                      value={faq.question}
                      onChange={(e) => handleFaqChange(i, 'question', e.target.value)}
                      placeholder="Enter question"
                      className="admin-faq-input"
                    />
                    <textarea 
                      value={faq.answer}
                      onChange={(e) => handleFaqChange(i, 'answer', e.target.value)}
                      placeholder="Enter answer"
                      rows="3"
                      className="admin-faq-textarea"
                    />
                  </div>
                ))}
                <button type="button" className="add-highlight-btn" onClick={addFaq} style={{ marginTop: '1rem' }}>
                  <i className="fa-solid fa-plus"></i> Add FAQ
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Sources' && (
            <div className="admin-form-section">
              <h3>External Sources & Downloads</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                Add PDFs, documents, or external links as references for this service.
              </p>
              <div className="admin-faqs-list">
                {formData.sources.map((source, i) => (
                  <div key={i} className="admin-source-item" data-type={source.type}>
                    <div className="admin-source-type-icon">
                      <i className={source.type === 'file' ? "fa-solid fa-file-pdf" : "fa-solid fa-link"}></i>
                    </div>
                    <div className="admin-source-main">
                      <div className="admin-source-fields">
                        <div className="admin-form-group">
                          <label>Title / Label</label>
                          <input 
                            value={source.title}
                            onChange={(e) => handleSourceChange(i, 'title', e.target.value)}
                            placeholder="e.g. Scheme Guidelines"
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>{source.type === 'file' ? 'File URL' : 'External Link'}</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              value={source.url}
                              onChange={(e) => handleSourceChange(i, 'url', e.target.value)}
                              placeholder={source.type === 'file' ? 'Click upload or paste URL' : 'https://...'}
                            />
                            {source.type === 'file' && (
                              <label className="change-image-btn" style={{ margin: 0, height: '38px', whiteSpace: 'nowrap' }}>
                                {imageUploading ? '…' : 'Upload'}
                                <input 
                                  type="file" 
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleSourceFileUpload(i, e.target.files[0])}
                                  disabled={imageUploading}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="admin-source-actions">
                      <button type="button" onClick={() => removeSource(i)} className="remove-item-btn" title="Remove Source">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
                  <button type="button" className="add-highlight-btn" onClick={() => addSource('file')}>
                    <i className="fa-solid fa-file-pdf"></i> Add PDF/File
                  </button>
                  <button type="button" className="add-highlight-btn" onClick={() => addSource('link')}>
                    <i className="fa-solid fa-link"></i> Add External Link
                  </button>
                </div>
              </div>
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
                <button
                  className="delete-service-final-btn"
                  type="button"
                  disabled={!isEdit}
                  onClick={handleDelete}
                >
                  <i className="fa-solid fa-trash"></i> Delete Service
                </button>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="admin-loader-container">
            <div className="admin-loader"></div>
            <span>Loading service details...</span>
          </div>
        )}
        {saveError && (
          <div style={{ padding: '10px 16px', margin: '0 18px', color: '#b91c1c', background: '#fef2f2', borderRadius: 8, fontSize: 13 }}>
            {saveError}
          </div>
        )}

        <footer className="admin-service-detail-footer">
          <button className="cancel-btn" onClick={() => navigate('/admin/services')}>Cancel</button>
          <button 
            className="save-changes-btn" 
            onClick={handleNextOrSave} 
            disabled={saving || loading || imageUploading}
          >
            {saving ? 'Saving…' : (!isFormValid() || (!isEdit && activeTab !== 'SEO')) ? 'Next' : isEdit ? 'Save' : 'Create'}
          </button>
        </footer>
      </div>
    </AdminShell>
  )
}

export default AdminServiceDetail
