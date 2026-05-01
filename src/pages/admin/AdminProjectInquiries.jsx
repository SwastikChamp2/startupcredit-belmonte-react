import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminShell from './AdminShell'

const PROJECT_INQUIRIES_STORAGE_KEY = 'startupCreditProjectInquiries'

const SEEDED_INQUIRIES = [
  {
    id: 'inquiry-cold-storage',
    projectTitle: 'Agri Cold Storage Unit',
    projectDescription: 'Cold storage facility for fruits and vegetables.',
    createdAt: '12 May 2024, 10:30 AM',
    status: 'Inquiry Pending',
    submittedByType: 'Self',
    creatorName: 'Aarav Sharma',
    creatorEmail: 'aarav.sharma@example.com',
    sectionCode: 'H',
    sectionName: 'Transportation and Storage',
    divisionCode: '52',
    divisionName: 'Warehousing and support activities for transportation',
    groupCode: '521',
    groupName: 'Warehousing and storage',
    classCode: '5210',
    className: 'Warehousing and storage',
    nicCode: '52102',
    nicName: 'Storage and warehousing',
  },
  {
    id: 'inquiry-solar-panel',
    projectTitle: 'Solar Panel Manufacturing',
    projectDescription: 'Production unit for solar panels.',
    createdAt: '28 June 2024, 04:15 PM',
    status: 'Inquiry Accepted',
    submittedByType: 'Associate',
    creatorName: 'Priya Nair',
    creatorEmail: 'priya.nair@example.com',
    sectionCode: 'C',
    sectionName: 'Manufacturing',
    divisionCode: '27',
    divisionName: 'Manufacture of electrical equipment',
    groupCode: '271',
    groupName: 'Manufacture of electric motors, generators and transformers',
    classCode: '2710',
    className: 'Manufacture of electric motors, generators and transformers',
    nicCode: '29309',
    nicName: 'Manufacture of electrical equipment',
  },
  {
    id: 'inquiry-food-processing',
    projectTitle: 'Food Processing Plant',
    projectDescription: 'Processing and packaging unit for spices.',
    createdAt: '09 August 2024, 11:20 AM',
    status: 'Inquiry Pending',
    submittedByType: 'Self',
    creatorName: 'Rohan Mehta',
    creatorEmail: 'rohan.mehta@example.com',
    sectionCode: 'C',
    sectionName: 'Manufacturing',
    divisionCode: '10',
    divisionName: 'Manufacture of food products',
    groupCode: '103',
    groupName: 'Processing and preserving of fruit and vegetables',
    classCode: '1030',
    className: 'Processing and preserving of fruit and vegetables',
    nicCode: '10309',
    nicName: 'Processing and preserving of fruits and vegetables',
  },
  {
    id: 'inquiry-it-services',
    projectTitle: 'IT Solutions and Services',
    projectDescription: 'Software development and IT consulting services.',
    createdAt: '17 October 2024, 09:45 AM',
    status: 'Inquiry Accepted',
    submittedByType: 'Associate',
    creatorName: 'Ananya Iyer',
    creatorEmail: 'ananya.iyer@example.com',
    sectionCode: 'J',
    sectionName: 'Information and Communication',
    divisionCode: '62',
    divisionName: 'Computer programming, consultancy and related activities',
    groupCode: '620',
    groupName: 'Computer programming, consultancy and related activities',
    classCode: '6202',
    className: 'Computer consultancy and computer facilities management',
    nicCode: '62020',
    nicName: 'Computer programming, consultancy and related activities',
  },
]

function readStoredInquiries() {
  try {
    return JSON.parse(localStorage.getItem(PROJECT_INQUIRIES_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getStatusClass(status) {
  return status === 'Inquiry Accepted' ? 'accepted' : 'pending'
}

function AdminProjectInquiries() {
  const isAuthenticated = localStorage.getItem('startupCreditAdminAuth') === 'true'
  const [inquiries, setInquiries] = useState(() => [
    ...SEEDED_INQUIRIES,
    ...readStoredInquiries(),
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [selectedInquiry, setSelectedInquiry] = useState(null)

  const filteredInquiries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return inquiries.filter((inquiry) => {
      const matchesStatus =
        statusFilter === 'All' || inquiry.status === statusFilter
      const matchesSource =
        sourceFilter === 'All' || inquiry.submittedByType === sourceFilter
      const matchesSearch =
        !query ||
        inquiry.projectTitle.toLowerCase().includes(query) ||
        inquiry.creatorName.toLowerCase().includes(query) ||
        inquiry.creatorEmail.toLowerCase().includes(query) ||
        inquiry.nicCode.toLowerCase().includes(query)

      return matchesStatus && matchesSource && matchesSearch
    })
  }, [inquiries, searchTerm, sourceFilter, statusFilter])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const acceptInquiry = (inquiryId) => {
    setInquiries((currentInquiries) =>
      currentInquiries.map((inquiry) =>
        inquiry.id === inquiryId
          ? { ...inquiry, status: 'Inquiry Accepted' }
          : inquiry,
      ),
    )
  }

  return (
    <AdminShell
      title="Project Inquiries"
      subtitle="View and manage project inquiries submitted through the website."
    >
      <section className="admin-users-card admin-inquiries-card">
        <div className="admin-users-toolbar admin-inquiries-toolbar">
          <label className="admin-users-search admin-inquiry-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input
              aria-label="Search project inquiries"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by project, name, email, or NIC code..."
              type="search"
              value={searchTerm}
            />
          </label>

          <select
            className="admin-filter-select"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
            aria-label="Filter by inquiry status"
          >
            <option value="All">All Status</option>
            <option value="Inquiry Pending">Inquiry Pending</option>
            <option value="Inquiry Accepted">Inquiry Accepted</option>
          </select>

          <select
            className="admin-filter-select"
            onChange={(event) => setSourceFilter(event.target.value)}
            value={sourceFilter}
            aria-label="Filter by inquiry source"
          >
            <option value="All">All Sources</option>
            <option value="Self">Self</option>
            <option value="Associate">Associate</option>
          </select>
        </div>

        <div className="admin-users-table-wrap">
          <table className="admin-users-table admin-inquiries-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>NIC Code</th>
                <th>Created By</th>
                <th>Inquiry Source</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>
                    <div className="admin-project-cell">
                      <strong>{inquiry.projectTitle}</strong>
                      <span>{inquiry.projectDescription}</span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-project-cell">
                      <strong>{inquiry.nicCode}</strong>
                      <span>{inquiry.nicName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-user-name">
                      <span>{getInitials(inquiry.creatorName)}</span>
                      <div className="admin-project-cell">
                        <strong>{inquiry.creatorName}</strong>
                        <span>{inquiry.creatorEmail}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-source ${inquiry.submittedByType.toLowerCase()}`}>
                      {inquiry.submittedByType}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-inquiry-status ${getStatusClass(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-user-actions">
                      <button onClick={() => setSelectedInquiry(inquiry)} type="button">
                        View
                      </button>
                      <button
                        disabled={inquiry.status === 'Inquiry Accepted'}
                        onClick={() => acceptInquiry(inquiry.id)}
                        type="button"
                      >
                        Accept
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInquiries.length === 0 && (
            <div className="admin-users-empty">
              <i className="fa-regular fa-folder-open" aria-hidden="true"></i>
              <strong>No project inquiries found</strong>
              <span>Try changing the search or filters.</span>
            </div>
          )}
        </div>

        <footer className="admin-users-footer">
          Showing {filteredInquiries.length} of {inquiries.length} inquiries
        </footer>
      </section>

      {selectedInquiry && (
        <div className="admin-modal-backdrop" role="presentation">
          <section
            aria-labelledby="inquiry-details-title"
            className="admin-modal"
            role="dialog"
            aria-modal="true"
          >
            <header className="admin-modal-header">
              <div>
                <p>Project Inquiry</p>
                <h2 id="inquiry-details-title">{selectedInquiry.projectTitle}</h2>
              </div>
              <button
                aria-label="Close inquiry details"
                onClick={() => setSelectedInquiry(null)}
                type="button"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </header>

            <div className="admin-modal-body">
              <div className="admin-detail-block">
                <strong>Project Description</strong>
                <p>{selectedInquiry.projectDescription}</p>
              </div>

              <div className="admin-detail-grid">
                <div>
                  <span>Created By</span>
                  <strong>{selectedInquiry.creatorName}</strong>
                  <p>{selectedInquiry.creatorEmail}</p>
                </div>
                <div>
                  <span>Inquiry Source</span>
                  <strong>{selectedInquiry.submittedByType}</strong>
                </div>
                <div>
                  <span>Created On</span>
                  <strong>{selectedInquiry.createdAt}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{selectedInquiry.status}</strong>
                </div>
              </div>

              <div className="admin-detail-block">
                <strong>NIC Classification</strong>
                <ul className="admin-nic-list">
                  <li>Section {selectedInquiry.sectionCode} - {selectedInquiry.sectionName}</li>
                  <li>Division {selectedInquiry.divisionCode} - {selectedInquiry.divisionName}</li>
                  <li>Group {selectedInquiry.groupCode} - {selectedInquiry.groupName}</li>
                  <li>Class {selectedInquiry.classCode} - {selectedInquiry.className}</li>
                  <li>NIC {selectedInquiry.nicCode} - {selectedInquiry.nicName}</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  )
}

export default AdminProjectInquiries
