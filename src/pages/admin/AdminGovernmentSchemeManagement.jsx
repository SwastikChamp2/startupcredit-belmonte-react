import { useState, useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AdminShell from './AdminShell'
import AdminPagination from './AdminPagination'
import useAdminPagination from './useAdminPagination'
import { mockGovernmentSchemes, GOVT_SCHEME_CATEGORIES, MINISTRIES } from './mockGovernmentSchemes'
import './admin.css'

function AdminGovernmentSchemeManagement() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All Schemes')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [ministryFilter, setMinistryFilter] = useState('All Ministries')
  
  const [schemes, setSchemes] = useState(mockGovernmentSchemes)
  const [ministriesList, setMinistriesList] = useState(MINISTRIES)
  const [newMinistry, setNewMinistry] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [schemeToDelete, setSchemeToDelete] = useState(null)

  const handleToggleStatus = (id, currentStatus) => {
    setSchemes(schemes.map(s => 
      s.id === id ? { ...s, status: currentStatus === 'Published' ? 'Draft' : 'Published' } : s
    ))
    setOpenMenuId(null)
  }

  const handleDeleteClick = (id) => {
    setSchemeToDelete(id)
    setOpenMenuId(null)
  }

  const confirmDelete = () => {
    setSchemes(schemes.filter(s => s.id !== schemeToDelete))
    setSchemeToDelete(null)
  }

  const filteredSchemes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return schemes.filter((scheme) => {
      const matchesSearch = !query || 
        scheme.name.toLowerCase().includes(query) || 
        scheme.slug.toLowerCase().includes(query) ||
        (scheme.fullTitle && scheme.fullTitle.toLowerCase().includes(query))
      
      const matchesStatus = statusFilter === 'All Status' || scheme.status === statusFilter
      
      const matchesMinistry = ministryFilter === 'All Ministries' || scheme.ministry === ministryFilter
      
      return matchesSearch && matchesStatus && matchesMinistry
    })
  }, [schemes, searchTerm, statusFilter, ministryFilter])
  const schemesPagination = useAdminPagination(filteredSchemes)

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const handleAddMinistry = (e) => {
    e.preventDefault()
    if (newMinistry.trim() && !ministriesList.includes(newMinistry.trim())) {
      setMinistriesList([...ministriesList, newMinistry.trim()])
      setNewMinistry('')
    }
  }

  const handleDeleteMinistry = (minToDelete) => {
    setMinistriesList(ministriesList.filter(m => m !== minToDelete))
  }

  return (
    <AdminShell
      title="Government Scheme Management"
      subtitle="Manage all government schemes, categories and scheme content."
    >
      <section className="admin-users-card admin-schemes-card">
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
              className={activeTab === 'Ministries' ? 'active' : ''}
              onClick={() => setActiveTab('Ministries')}
              type="button"
            >
              Ministries ({ministriesList.length})
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All Status">All Status</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>

                <select
                  className="admin-filter-select"
                  value={ministryFilter}
                  onChange={(e) => setMinistryFilter(e.target.value)}
                >
                  <option value="All Ministries">All Ministries</option>
                  {ministriesList.map(min => (
                    <option key={min} value={min}>{min}</option>
                  ))}
                </select>

                <button className="admin-filter-btn">
                  <i className="fa-solid fa-filter"></i> Filter
                </button>
              </div>

              <div className="admin-services-actions">
                <button 
                  className="admin-add-service-btn"
                  onClick={() => navigate('/admin/government-schemes/new')}
                >
                  <i className="fa-solid fa-plus"></i> Add New Scheme
                </button>
                <button className="admin-export-btn">
                  <i className="fa-solid fa-download"></i> Export
                </button>
              </div>
            </div>

            <div className="admin-users-table-wrap">
              <table className="admin-users-table admin-services-table">
                <thead>
                  <tr>
                    <th>Scheme Name</th>
                    <th>Ministry</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schemesPagination.paginatedItems.map((scheme) => (
                    <tr key={scheme.id}>
                      <td>
                        <div className="admin-service-cell-info">
                          <div>
                            <strong>{scheme.name}</strong>
                            <span>{scheme.fullTitle || scheme.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-ministry-text">{scheme.ministry || 'N/A'}</span>
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
                                  onClick={() => handleToggleStatus(scheme.id, scheme.status)}
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

            <AdminPagination
              {...schemesPagination}
              itemLabel="schemes"
              totalRecords={schemes.length}
            />

          </>
        ) : (
          <div className="admin-categories-view">
            <div className="admin-category-add-form">
              <h3>Add New Ministry</h3>
              <form onSubmit={handleAddMinistry}>
                <input 
                  type="text" 
                  placeholder="Enter ministry name..." 
                  value={newMinistry}
                  onChange={(e) => setNewMinistry(e.target.value)}
                />
                <button type="submit" className="admin-add-service-btn">Add Ministry</button>
              </form>
            </div>

            <div className="admin-category-list">
              <h3>Existing Ministries</h3>
              <div className="admin-category-grid">
                {ministriesList.map((min) => (
                  <div key={min} className="admin-category-item">
                    <span>{min}</span>
                    <div className="admin-category-actions">
                      <button className="admin-edit-btn"><i className="fa-solid fa-pencil"></i></button>
                      <button 
                        className="admin-delete-btn"
                        onClick={() => handleDeleteMinistry(min)}
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
