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
  const [viewMode, setViewMode] = useState('ui')
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    fullTitle: '',
    slug: '',
    status: 'Published',
    order: 1,
    category: '',
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
    lastUpdated: '',
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
            // Migrate from categories array to category string
            const schemeWithMigration = {
              ...data.scheme,
              category: data.scheme.category || (data.scheme.categories?.[0] || ''),
            }
            setFormData((prev) => ({
              ...prev,
              ...schemeWithMigration,
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
  }, [schemeId, isEdit, categoryLookup])

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

  const handleRichTextChange = (name, value) => {
    setFormData(prev => {
      const updates = { [name]: value }

      if (name === 'description') {
        if (!prev.seoDescription || prev.seoDescription === prev.description) {
          updates.seoDescription = value
        }
      }

      return { ...prev, ...updates }
    })
  }

  const handleCategorySelect = (e) => {
    const selectedCategory = e.target.value
    setFormData(prev => {
      const categoryId = selectedCategory ? categoryLookup.nameToId[selectedCategory] || '' : ''
      return { ...prev, category: selectedCategory, categoryId }
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
    'category',
    'objective',
    'benefits',
    'beneficiary',
    'eligibilityCriteria',
    'description'
  ]
  const isFormValid = () => REQUIRED_FIELDS.every(key => !!formData[key])

  const handleNextOrSave = async () => {
    setSaveError('')
    
    if (viewMode === 'json' && jsonError) {
      setSaveError('Please fix JSON errors before saving.')
      return
    }

    if (viewMode === 'json' && !jsonToFormData(jsonText)) {
      setSaveError('Invalid JSON. Please fix the errors before saving.')
      return
    }
    
    if (!isFormValid()) {
      // Find which tab the first missing field is in and go there
      if (!formData.name) {
        setSaveError('Please enter a Scheme Name.')
        setActiveTab('Overview')
      } else if (!formData.slug) {
        setSaveError('Please enter a Slug.')
        setActiveTab('Overview')
      } else if (!formData.category) {
        setSaveError('Please select a Category.')
        setActiveTab('Overview')
      } else if (!formData.objective) {
        setSaveError('Please enter the Objective.')
        setActiveTab('Objective')
      } else if (!formData.benefits) {
        setSaveError('Please enter the Benefits.')
        setActiveTab('Benefits')
      } else if (!formData.beneficiary) {
        setSaveError('Please enter the Beneficiary information.')
        setActiveTab('Beneficiary')
      } else if (!formData.eligibilityCriteria) {
        setSaveError('Please enter the Eligibility Criteria.')
        setActiveTab('Eligibility')
      } else if (!formData.description) {
        setSaveError('Please enter the Description.')
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

  const formDataToJson = () => {
    return JSON.stringify(formData, null, 2)
  }

  const jsonToFormData = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString)
      setJsonError('')
      setFormData(prev => ({ ...prev, ...parsed }))
      return true
    } catch (err) {
      setJsonError(`Invalid JSON: ${err.message}`)
      return false
    }
  }

  const handleToggleView = (mode) => {
    if (mode === 'json') {
      setJsonText(formDataToJson())
      setJsonError('')
    } else {
      if (jsonError) {
        return
      }
      if (!jsonToFormData(jsonText)) {
        return
      }
    }
    setViewMode(mode)
  }

  const handleJsonChange = (e) => {
    setJsonText(e.target.value)
    try {
      JSON.parse(e.target.value)
      setJsonError('')
    } catch (err) {
      setJsonError(`Invalid JSON: ${err.message}`)
    }
  }

  const loadDefaultTemplate = () => {
    const template = {
      name: 'Startup India Seed Fund Scheme',
      fullTitle: 'Startup India Seed Fund Scheme (SISFS)',
      slug: 'startup-india-seed-fund-scheme',
      status: 'Published',
      order: 1,
      category: 'Incentives',
      categoryId: 'incentives',
      highlights: [
        'Provides seed funding to startups',
        'Supports proof of concept, prototype development, and product trials',
        'Funding up to ₹20 lakh for early-stage startups'
      ],
      tags: ['startup', 'funding', 'seed-fund', 'innovation'],
      image: '',
      objective: '<p>To provide financial assistance to startups for proof of concept, prototype development, and product trials. The scheme aims to create a robust startup ecosystem in India by supporting early-stage startups with seed capital.</p>',
      benefits: '<p><ul><li>Seed funding up to ₹20 lakh for eligible startups</li><li>Support for product development and market entry</li><li>Mentorship and guidance from industry experts</li><li>Access to incubation facilities and resources</li></ul></p>',
      beneficiary: '<p>Early-stage startups registered in India, not older than 2 years, with innovative business ideas and potential for scalability.</p>',
      eligibilityCriteria: '<p><ul><li>Startup must be incorporated in India</li><li>Should not be older than 2 years from date of incorporation</li><li>Must have a innovative business idea</li><li>Should not have received more than ₹10 lakh in funding</li><li>Must be recommended by an incubator</li></ul></p>',
      description: '<p>The Startup India Seed Fund Scheme (SISFS) is a government initiative designed to provide financial support to early-stage startups. The scheme aims to address the lack of seed capital in the Indian startup ecosystem and help startups transform their innovative ideas into viable businesses.</p><p>Under this scheme, eligible startups can receive seed funding of up to ₹20 lakh to support various activities including proof of concept, prototype development, product trials, and market entry. The funding is provided through eligible incubators across India.</p>',
      content: '',
      documents: ['Certificate of Incorporation', 'PAN Card', 'Aadhar Card of Directors', 'Business Plan', 'Pitch Deck'],
      sections: [],
      seoTitle: 'Startup India Seed Fund Scheme - Government Funding for Startups',
      seoDescription: 'Apply for Startup India Seed Fund Scheme (SISFS) to get seed funding up to ₹20 lakh for your early-stage startup. Know eligibility, benefits, and application process.',
      lastUpdated: new Date().toISOString()
    }
    setJsonText(JSON.stringify(template, null, 2))
    setJsonError('')
  }

  const copyAIPrompt = () => {
    const categoryList = allCategories.length > 0
      ? allCategories.map(cat => `- ${cat.name} [ID: ${cat.id}]`).join('\n')
      : '- Incentives [ID: incentives]\n- Technology [ID: technology]\n- Manufacturing [ID: manufacturing]\n- Agriculture [ID: agriculture]\n- Healthcare [ID: healthcare]\n- Education [ID: education]\n- Women Empowerment [ID: women-empowerment]\n- Rural Development [ID: rural-development]\n- Urban Development [ID: urban-development]\n- Energy [ID: energy]\n- Finance [ID: finance]\n- Infrastructure [ID: infrastructure]\n- Environment [ID: environment]\n- MSME [ID: msme]\n- Innovation [ID: innovation]\n- Social Welfare [ID: social-welfare]'

    const prompt = `Please provide the government scheme data in the following JSON format. Replace <EXPLAIN YOUR GOVERNMENT SCHEME HERE> with the actual details of the government scheme you want me to format.

IMPORTANT: For the "category" field, select ONE appropriate category from these existing Government Scheme Categories (use the category name):
${categoryList}

IMPORTANT: Keep the content simple and easy to read. Avoid using headings, bold, and italics; use them only when necessary. Prefer paragraphs, unordered lists (ul), and ordered lists (ol) for most of the content.

For the "categoryId" field, use the ID shown in brackets for the selected category.

Example of a properly formatted government scheme (Startup India Seed Fund Scheme):

{
  "name": "Startup India Seed Fund Scheme",
  "fullTitle": "Startup India Seed Fund Scheme (SISFS)",
  "slug": "startup-india-seed-fund-scheme",
  "status": "Published",
  "order": 1,
  "category": "Incentives",
  "categoryId": "incentives",
  "highlights": [
    "Provides seed funding to startups",
    "Supports proof of concept, prototype development, and product trials",
    "Funding up to ₹20 lakh for early-stage startups"
  ],
  "tags": ["startup", "funding", "seed-fund", "innovation"],
  "image": "",
  "objective": "<p>To provide financial assistance to startups for proof of concept, prototype development, and product trials. The scheme aims to create a robust startup ecosystem in India by supporting early-stage startups with seed capital.</p>",
  "benefits": "<p><ul><li>Seed funding up to ₹20 lakh for eligible startups</li><li>Support for product development and market entry</li><li>Mentorship and guidance from industry experts</li><li>Access to incubation facilities and resources</li></ul></p>",
  "beneficiary": "<p>Early-stage startups registered in India, not older than 2 years, with innovative business ideas and potential for scalability.</p>",
  "eligibilityCriteria": "<p><ul><li>Startup must be incorporated in India</li><li>Should not be older than 2 years from date of incorporation</li><li>Must have a innovative business idea</li><li>Should not have received more than ₹10 lakh in funding</li><li>Must be recommended by an incubator</li></ul></p>",
  "description": "<p>The Startup India Seed Fund Scheme (SISFS) is a government initiative designed to provide financial support to early-stage startups. The scheme aims to address the lack of seed capital in the Indian startup ecosystem and help startups transform their innovative ideas into viable businesses.</p><p>Under this scheme, eligible startups can receive seed funding of up to ₹20 lakh to support various activities including proof of concept, prototype development, product trials, and market entry. The funding is provided through eligible incubators across India.</p>",
  "content": "",
  "documents": ["Certificate of Incorporation", "PAN Card", "Aadhar Card of Directors", "Business Plan", "Pitch Deck"],
  "sections": [],
  "seoTitle": "Startup India Seed Fund Scheme - Government Funding for Startups",
  "seoDescription": "Apply for Startup India Seed Fund Scheme (SISFS) to get seed funding up to ₹20 lakh for your early-stage startup. Know eligibility, benefits, and application process."
}

<EXPLAIN YOUR GOVERNMENT SCHEME HERE>

Please format the response as valid JSON only, without any additional text or markdown formatting.`
    
    navigator.clipboard.writeText(prompt).then(() => {
      alert('AI Prompt copied to clipboard!')
    }).catch(err => {
      console.error('Failed to copy: ', err)
      alert('Failed to copy prompt. Please try again.')
    })
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
        <div className="view-mode-toggle">
          <button
            className={`toggle-btn ${viewMode === 'ui' ? 'active' : ''}`}
            onClick={() => handleToggleView('ui')}
            type="button"
          >
            UI
          </button>
          <button
            className={`toggle-btn ${viewMode === 'json' ? 'active' : ''}`}
            onClick={() => handleToggleView('json')}
            type="button"
          >
            JSON
          </button>
        </div>
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
          {viewMode === 'json' ? (
            <div className="json-editor-container">
              <div className="json-editor-header">
                <h3>JSON Editor</h3>
                <div className="json-editor-actions">
                  <button
                    className="json-action-btn"
                    onClick={loadDefaultTemplate}
                    type="button"
                  >
                    <i className="fa-solid fa-file-code"></i> Load Default Template
                  </button>
                  <button
                    className="json-action-btn"
                    onClick={copyAIPrompt}
                    type="button"
                  >
                    <i className="fa-solid fa-copy"></i> Copy AI Prompt
                  </button>
                </div>
              </div>
              <textarea
                className="json-textarea"
                value={jsonText}
                onChange={handleJsonChange}
                placeholder="Paste or edit JSON here..."
                spellCheck="false"
              />
              {jsonError && (
                <div className="json-error-message">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {jsonError}
                </div>
              )}
            </div>
          ) : (
            <>
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
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleCategorySelect}
                    >
                      <option value="">Select a category</option>
                      {(categoryNames || []).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {categoryNames.length === 0 && (
                      <span style={{ fontSize: 13, color: '#94a3b8', marginTop: '4px', display: 'block' }}>No categories yet — add some on the management page.</span>
                    )}
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
                onChange={(value) => handleRichTextChange('objective', value)}
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
                onChange={(value) => handleRichTextChange('benefits', value)}
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
                onChange={(value) => handleRichTextChange('beneficiary', value)}
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
                onChange={(value) => handleRichTextChange('eligibilityCriteria', value)}
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
                onChange={(value) => handleRichTextChange('description', value)}
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
            </>
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
