import { useState, useMemo, useEffect, useCallback } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import {
  fetchAdminSchemes,
  updateAdminScheme,
  deleteAdminScheme,
  createSchemeCategory,
  updateSchemeCategory,
  deleteSchemeCategory,
} from '../../services/adminDataApi'
import './admin.css'

function AdminGovernmentSchemeManagement() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All Schemes')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [statusFilter, setStatusFilter] = useState('All Status')

  const [schemes, setSchemes] = useState([])
  const [rawCategories, setRawCategories] = useState([])
  const [categoryLookup, setCategoryLookup] = useState({ idToName: {}, nameToId: {} })
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const [newCategory, setNewCategory] = useState('')
  const [newCategoryId, setNewCategoryId] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [schemeToDelete, setSchemeToDelete] = useState(null)

  const categories = useMemo(() => rawCategories.map((c) => c.name), [rawCategories])

  const generateCategoryId = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
  }

  const reload = useCallback(async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const data = await fetchAdminSchemes()
      setSchemes(data.schemes)
      setRawCategories(data.categories)
      setCategoryLookup(data.categoryLookup)
    } catch (err) {
      setErrorMsg(err?.message || 'Could not load government schemes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const handleToggleStatus = async (scheme) => {
    setOpenMenuId(null)
    const nextStatus = scheme.status === 'Published' ? 'Draft' : 'Published'
    try {
      await updateAdminScheme(scheme.id, { ...scheme, status: nextStatus }, categoryLookup)
      await reload()
    } catch (err) {
      setErrorMsg(err?.message || 'Could not update status.')
    }
  }

  const handleDeleteClick = (id) => {
    setSchemeToDelete(id)
    setOpenMenuId(null)
  }

  const confirmDelete = async () => {
    try {
      await deleteAdminScheme(schemeToDelete)
      setSchemeToDelete(null)
      await reload()
    } catch (err) {
      setErrorMsg(err?.message || 'Could not delete scheme.')
      setSchemeToDelete(null)
    }
  }

  const filteredSchemes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    const filtered = schemes.filter((scheme) => {
      const matchesSearch = !query ||
        scheme.name.toLowerCase().includes(query) ||
        scheme.slug.toLowerCase().includes(query) ||
        (scheme.fullTitle && scheme.fullTitle.toLowerCase().includes(query))

      const matchesCategory = categoryFilter === 'All Categories' ||
        scheme.category === categoryFilter

      const matchesStatus = statusFilter === 'All Status' || scheme.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })

    // Sort by lastUpdated, most recent first
    return filtered.sort((a, b) => {
      const dateA = new Date(a.lastUpdated || 0)
      const dateB = new Date(b.lastUpdated || 0)
      return dateB - dateA
    })
  }, [schemes, searchTerm, categoryFilter, statusFilter])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    const name = newCategory.trim()
    const id = newCategoryId.trim() || generateCategoryId(name)
    if (!name || categories.includes(name)) {
      setNewCategory('')
      setNewCategoryId('')
      return
    }
    // Check if ID already exists
    if (rawCategories.some((c) => c.id === id)) {
      setErrorMsg('A category with this ID already exists.')
      setNewCategory('')
      setNewCategoryId('')
      return
    }
    try {
      await createSchemeCategory({ id, name, sortOrder: rawCategories.length })
      setNewCategory('')
      setNewCategoryId('')
      setErrorMsg('')
      await reload()
    } catch (err) {
      setErrorMsg(err?.message || 'Could not add category.')
      setNewCategory('')
      setNewCategoryId('')
    }
  }

  const handleDeleteCategory = async (catName) => {
    const target = rawCategories.find((c) => c.name === catName)
    if (!target) return
    try {
      await deleteSchemeCategory(target.id)
      if (categoryFilter === catName) setCategoryFilter('All Categories')
      setEditingCategory(null)
      setEditingCategoryName('')
      setEditingCategoryId('')
      await reload()
    } catch (err) {
      setErrorMsg(err?.message || 'Could not delete category.')
    }
  }

  const startEditCategory = (category) => {
    const target = rawCategories.find((c) => c.name === category)
    setEditingCategory(category)
    setEditingCategoryName(category)
    setEditingCategoryId(target?.id || generateCategoryId(category))
    setErrorMsg('')
  }

  const cancelEditCategory = () => {
    setEditingCategory(null)
    setEditingCategoryName('')
    setEditingCategoryId('')
    setErrorMsg('')
  }

  const saveCategoryEdit = async () => {
    const nextName = editingCategoryName.trim()
    const nextId = editingCategoryId.trim()
    const target = rawCategories.find((c) => c.name === editingCategory)
    if (!target) return
    if (!nextName || !nextId || (nextName !== editingCategory && categories.includes(nextName))) return
    // Check if new ID already exists (excluding the current category)
    if (nextId !== target.id && rawCategories.some((c) => c.id === nextId)) {
      setErrorMsg('A category with this ID already exists.')
      return
    }
    try {
      await updateSchemeCategory(target.id, { id: nextId, name: nextName, sortOrder: target.sortOrder })
      if (categoryFilter === editingCategory) setCategoryFilter(nextName)
      cancelEditCategory()
      setErrorMsg('')
      await reload()
    } catch (err) {
      setErrorMsg(err?.message || 'Could not update category.')
    }
  }

  return (
    <AdminShell
      title="Government Scheme Management"
      subtitle="Manage all government schemes, categories and scheme content."
    >
      <section className="admin-users-card admin-schemes-card">
        {errorMsg && (
          <div style={{ padding: '12px 18px', margin: '12px 18px 0', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
            {errorMsg}
          </div>
        )}
        {loading && (
          <div className="admin-loader-container">
            <div className="admin-loader"></div>
            <span>Loading schemes...</span>
          </div>
        )}
        <div className="admin-users-toolbar">
          <div className="admin-user-tabs">
            <button
              className={activeTab === 'All Schemes' ? 'active' : ''}
              onClick={() => setActiveTab('All Schemes')}
              type="button"
            >
              All Schemes ({schemes.length})
            </button>
            <button
              className={activeTab === 'Categories' ? 'active' : ''}
              onClick={() => setActiveTab('Categories')}
              type="button"
            >
              Categories ({categories.length})
            </button>
          </div>
        </div>

        {activeTab === 'All Schemes' ? (
          <>
            <div className="admin-users-toolbar admin-services-toolbar">
              <div className="admin-services-filters">
                <label className="admin-users-search admin-service-search">
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                  <input
                    placeholder="Search by scheme name or keyword..."
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </label>

                <select
                  className="admin-filter-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All Categories">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  className="admin-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All Status">All Status</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>

              </div>

              <div className="admin-services-actions">
                <button 
                  className="admin-add-service-btn"
                  onClick={() => navigate('/admin/government-schemes/new')}
                >
                  <i className="fa-solid fa-plus"></i> Add New Scheme
                </button>
              </div>
            </div>

            <div className="admin-users-table-wrap">
              <table className="admin-users-table admin-services-table">
                <thead>
                  <tr>
                    <th>Scheme Name</th>
                    <th>Categories</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchemes.map((scheme) => (
                    <tr key={scheme.id}>
                      <td>
                        <div className="admin-service-cell-info">
                          <div className="admin-avatar">{scheme.avatar}</div>
                          <div>
                            <strong>{scheme.name}</strong>
                            <span>{scheme.fullTitle || scheme.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-cat-badges-list">
                          {scheme.category ? (
                            <span key={scheme.category} className="admin-service-cat-badge">{scheme.category}</span>
                          ) : (
                            <span style={{ fontSize: 13, color: '#94a3b8' }}>Uncategorized</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-service-status-badge ${scheme.status?.toLowerCase()}`}>
                          {scheme.status}
                        </span>
                      </td>
                      <td>{scheme.lastUpdated}</td>
                      <td>
                        <div className="admin-user-actions">
                          <button 
                            type="button"
                            onClick={() => navigate(`/admin/government-schemes/${scheme.id}`)}
                          >
                            Edit
                          </button>
                          <div style={{ position: 'relative' }}>
                            <button 
                              className="admin-more-btn"
                              onClick={() => setOpenMenuId(openMenuId === scheme.id ? null : scheme.id)}
                            >
                              <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                            {openMenuId === scheme.id && (
                              <div style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: '4px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                zIndex: 50,
                                minWidth: '140px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px'
                              }}>
                                <button
                                  style={{ padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%', fontSize: '13px', borderRadius: '4px', color: '#334155' }}
                                  onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                                  onMouseOut={(e) => e.target.style.background = 'transparent'}
                                  onClick={() => handleToggleStatus(scheme)}
                                >
                                  {scheme.status === 'Published' ? 'Change to Draft' : 'Publish'}
                                </button>
                                <button 
                                  style={{ padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#ef4444', width: '100%', fontSize: '13px', borderRadius: '4px' }}
                                  onMouseOver={(e) => e.target.style.background = '#fef2f2'}
                                  onMouseOut={(e) => e.target.style.background = 'transparent'}
                                  onClick={() => handleDeleteClick(scheme.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


          </>
        ) : activeTab === 'Categories' ? (
          <div className="admin-categories-view">
            <div className="admin-category-add-form">
              <h3>Add New Category</h3>
              <form onSubmit={handleAddCategory}>
                <div className="admin-form-row">
                  <input
                    type="text"
                    placeholder="Enter category name..."
                    value={newCategory}
                    onChange={(e) => {
                      setNewCategory(e.target.value)
                      setNewCategoryId(generateCategoryId(e.target.value))
                      setErrorMsg('')
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Document ID (auto-generated)"
                    value={newCategoryId}
                    onChange={(e) => {
                      setNewCategoryId(e.target.value)
                      setErrorMsg('')
                    }}
                  />
                </div>
                <button type="submit" className="admin-add-service-btn">Add Category</button>
              </form>
            </div>

            <div className="admin-category-list">
              <h3>Existing Categories</h3>
              <div className="admin-category-grid">
                {rawCategories.map((cat) => (
                  <div key={cat.id} className="admin-category-item">
                    {editingCategory === cat.name ? (
                      <div className="admin-category-edit-fields">
                        <input
                          autoFocus
                          placeholder="Category name"
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveCategoryEdit()
                            if (e.key === 'Escape') cancelEditCategory()
                          }}
                          type="text"
                          value={editingCategoryName}
                        />
                        <input
                          placeholder="Document ID"
                          onChange={(e) => setEditingCategoryId(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveCategoryEdit()
                            if (e.key === 'Escape') cancelEditCategory()
                          }}
                          type="text"
                          value={editingCategoryId}
                        />
                      </div>
                    ) : (
                      <div className="admin-category-display">
                        <span className="admin-category-name">{cat.name}</span>
                        <span className="admin-category-id">{cat.id}</span>
                      </div>
                    )}
                    <div className="admin-category-actions">
                      {editingCategory === cat.name ? (
                        <>
                          <button className="admin-edit-btn" onClick={saveCategoryEdit} type="button">
                            <i className="fa-solid fa-check"></i>
                          </button>
                          <button className="admin-delete-btn" onClick={cancelEditCategory} type="button">
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="admin-edit-btn" onClick={() => startEditCategory(cat.name)} type="button">
                            <i className="fa-solid fa-pencil"></i>
                          </button>
                          <button
                            className="admin-delete-btn"
                            onClick={() => handleDeleteCategory(cat.name)}
                            type="button"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {schemeToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#0f172a' }}>Confirm Deletion</h3>
            <p style={{ margin: '0 0 24px 0', color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>Are you sure you want to delete this government scheme? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setSchemeToDelete(null)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontWeight: '500' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{ padding: '8px 16px', background: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#fff', fontWeight: '500' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

export default AdminGovernmentSchemeManagement
