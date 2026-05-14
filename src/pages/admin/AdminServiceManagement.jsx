import { useState, useMemo, useEffect, useCallback } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import AdminPagination from './AdminPagination'
import useAdminPagination from './useAdminPagination'
import {
  fetchAdminServices,
  deleteAdminService,
  updateAdminService,
  createServiceSection,
  updateServiceSection,
  deleteServiceSection,
} from '../../services/adminDataApi'
import './admin.css'

function AdminServiceManagement() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All Services')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [sortOrder, setSortOrder] = useState('asc')
  const [services, setServices] = useState([])
  const [sections, setSections] = useState([])
  const [sectionLookup, setSectionLookup] = useState({ idToTitle: {}, titleToId: {} })
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [serviceToDelete, setServiceToDelete] = useState(null)

  const categories = useMemo(() => sections.map((s) => s.title), [sections])

  const reload = useCallback(async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const data = await fetchAdminServices()
      setServices(data.services)
      setSections(data.sections)
      setSectionLookup(data.sectionLookup)
    } catch (err) {
      setErrorMsg(err?.message || 'Could not load services.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const handleToggleStatus = async (service) => {
    setOpenMenuId(null)
    const nextStatus = service.status === 'Published' ? 'Draft' : 'Published'
    try {
      await updateAdminService(service.id, { ...service, status: nextStatus }, sectionLookup)
      await reload()
    } catch (err) {
      setErrorMsg(err?.message || 'Could not update status.')
    }
  }

  const handleDeleteClick = (id) => {
    setServiceToDelete(id)
    setOpenMenuId(null)
  }

  const confirmDelete = async () => {
    try {
      await deleteAdminService(serviceToDelete)
      setServiceToDelete(null)
      await reload()
    } catch (err) {
      setErrorMsg(err?.message || 'Could not delete service.')
      setServiceToDelete(null)
    }
  }

  const filteredServices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    const filtered = services.filter((service) => {
      const matchesSearch = !query || service.name.toLowerCase().includes(query) || service.slug.toLowerCase().includes(query)
      const matchesCategory = categoryFilter === 'All Categories' || service.category === categoryFilter
      const matchesStatus = statusFilter === 'All Status' || service.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })

    return filtered.sort((a, b) => {
      const orderA = a.order ?? 0
      const orderB = b.order ?? 0
      return sortOrder === 'desc' ? orderB - orderA : orderA - orderB
    })
  }, [services, searchTerm, categoryFilter, statusFilter, sortOrder])
  const servicesPagination = useAdminPagination(filteredServices)

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    const title = newCategory.trim()
    if (!title || categories.includes(title)) return
    try {
      await createServiceSection({ title, sortOrder: sections.length })
      setNewCategory('')
      await reload()
    } catch (err) {
      setErrorMsg(err?.message || 'Could not add category.')
    }
  }

  const handleDeleteCategory = async (catToDelete) => {
    const target = sections.find((s) => s.title === catToDelete)
    if (!target) return
    try {
      await deleteServiceSection(target.id)
      await reload()
    } catch (err) {
      setErrorMsg(err?.message || 'Could not delete category.')
    }
  }

  // Reserved for future inline-edit flow on the Categories tab.
  // eslint-disable-next-line no-unused-vars
  const handleRenameCategory = async (oldTitle, nextTitle) => {
    const target = sections.find((s) => s.title === oldTitle)
    if (!target || !nextTitle.trim()) return
    try {
      await updateServiceSection(target.id, { title: nextTitle.trim(), sortOrder: target.sortOrder })
      await reload()
    } catch (err) {
      setErrorMsg(err?.message || 'Could not rename category.')
    }
  }

  return (
    <AdminShell
      title="Service Management"
      subtitle="Manage all services, categories and service content."
    >
      <section className="admin-users-card admin-services-card">
        {errorMsg && (
          <div style={{ padding: '12px 18px', margin: '12px 18px 0', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
            {errorMsg}
          </div>
        )}
        {loading && (
          <div className="admin-loader-container">
            <div className="admin-loader"></div>
            <span>Loading services...</span>
          </div>
        )}
        <div className="admin-users-toolbar">
          <div className="admin-user-tabs">
            <button
              className={activeTab === 'All Services' ? 'active' : ''}
              onClick={() => setActiveTab('All Services')}
              type="button"
            >
              All Services ({services.length})
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

        {activeTab === 'All Services' ? (
          <>
            <div className="admin-users-toolbar admin-services-toolbar">
              <div className="admin-services-filters">
                <label className="admin-users-search admin-service-search">
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                  <input
                    placeholder="Search by service name or slug..."
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
                  onClick={() => navigate('/admin/services/new')}
                >
                  <i className="fa-solid fa-plus"></i> Add New Service
                </button>
              </div>
            </div>

            <div className="admin-users-table-wrap">
              <table className="admin-users-table admin-services-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>
                      Order{' '}
                      <button
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
                        aria-label="Toggle sort order"
                        type="button"
                      >
                        <i className={`fa-solid fa-arrow-${sortOrder === 'desc' ? 'down' : 'up'}`} aria-hidden="true" style={{ color: 'var(--text-light)' }}></i>
                      </button>
                    </th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {servicesPagination.paginatedItems.map((service) => (
                    <tr key={service.id}>
                      <td>
                        <div className="admin-service-cell-info">
                          <img src={service.image} alt="" className="admin-service-thumb" />
                          <div>
                            <strong>{service.name}</strong>
                            <span>{service.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-service-cat-badge">{service.category}</span>
                      </td>
                      <td>
                        <span className={`admin-service-status-badge ${service.status.toLowerCase()}`}>
                          {service.status}
                        </span>
                      </td>
                      <td>{service.order}</td>
                      <td>{service.lastUpdated}</td>
                      <td>
                        <div className="admin-user-actions">
                          <button 
                            type="button"
                            onClick={() => navigate(`/admin/services/${service.id}`)}
                          >
                            Edit
                          </button>
                          <div style={{ position: 'relative' }}>
                            <button 
                              className="admin-more-btn"
                              onClick={() => setOpenMenuId(openMenuId === service.id ? null : service.id)}
                            >
                              <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                            {openMenuId === service.id && (
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
                                  onClick={() => handleToggleStatus(service)}
                                >
                                  {service.status === 'Published' ? 'Change to Draft' : 'Publish'}
                                </button>
                                <button 
                                  style={{ padding: '8px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#ef4444', width: '100%', fontSize: '13px', borderRadius: '4px' }}
                                  onMouseOver={(e) => e.target.style.background = '#fef2f2'}
                                  onMouseOut={(e) => e.target.style.background = 'transparent'}
                                  onClick={() => handleDeleteClick(service.id)}
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

            <AdminPagination
              {...servicesPagination}
              itemLabel="services"
              totalRecords={services.length}
            />

          </>
        ) : (
          <div className="admin-categories-view">
            <div className="admin-category-add-form">
              <h3>Add New Category</h3>
              <form onSubmit={handleAddCategory}>
                <input 
                  type="text" 
                  placeholder="Enter category name..." 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button type="submit" className="admin-add-service-btn">Add Category</button>
              </form>
            </div>

            <div className="admin-category-list">
              <h3>Existing Categories</h3>
              <div className="admin-category-grid">
                {categories.map((cat) => (
                  <div key={cat} className="admin-category-item">
                    <span>{cat}</span>
                    <div className="admin-category-actions">
                      <button className="admin-edit-btn"><i className="fa-solid fa-pencil"></i></button>
                      <button 
                        className="admin-delete-btn"
                        onClick={() => handleDeleteCategory(cat)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {serviceToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#0f172a' }}>Confirm Deletion</h3>
            <p style={{ margin: '0 0 24px 0', color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>Are you sure you want to delete this service? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setServiceToDelete(null)}
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

export default AdminServiceManagement
