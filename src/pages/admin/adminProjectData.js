export const PROJECT_STATUSES = [
  'In Discussion',
  'Project Started',
  'Awaiting Documents',
  'All Documents Sent',
  'Document Correction / Update',
  'Project Filing In Progress',
  'Project Filing Done',
  'Project Approval Pending',
  'Project Modification Requested',
  'Project Approved',
  'Post Approval Formalities Pending',
  'Project Completed',
]

const BASE_DOCUMENTS = [
  {
    id: 'doc-project-report',
    fieldName: 'Project Report',
    file: {
      name: 'project_report.pdf',
      type: 'PDF',
      size: '1.4 MB',
      uploadedOn: '12 May 2024, 10:30 AM',
    },
  },
  {
    id: 'doc-dpr',
    fieldName: 'DPR / Feasibility Report',
    file: {
      name: 'dpr_report.pdf',
      type: 'PDF',
      size: '2.1 MB',
      uploadedOn: '11 May 2024, 04:15 PM',
    },
  },
  {
    id: 'doc-land',
    fieldName: 'Land Ownership Proof',
    file: null,
  },
  {
    id: 'doc-financial',
    fieldName: 'Financial Projection',
    file: {
      name: 'financials.xlsx',
      type: 'Excel',
      size: '842 KB',
      uploadedOn: '09 May 2024, 09:45 AM',
    },
  },
]

const INITIAL_PROJECTS = [
  {
    id: 'project-solar-panel',
    projectTitle: 'Solar Panel Manufacturing',
    projectDescription: 'Production unit for solar panels with manufacturing capacity of 100 MW per annum.',
    status: 'In Discussion',
    lastUpdated: '12 May 2024, 10:30 AM',
    submittedByType: 'Associate',
    clientName: 'Priya Nair',
    clientEmail: 'priya.nair@example.com',
    clientPhone: '+91 98765 43210',
    organization: 'SunPower Solutions Pvt. Ltd.',
    designation: 'Director',
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
    documents: BASE_DOCUMENTS,
    notes: 'Client is evaluating machinery quotations and subsidy eligibility.',
  },
  {
    id: 'project-it-services',
    projectTitle: 'IT Solutions and Services',
    projectDescription: 'Software development and IT consulting services for domestic SME clients.',
    status: 'Project Filing In Progress',
    lastUpdated: '17 October 2024, 09:45 AM',
    submittedByType: 'Associate',
    clientName: 'Ananya Iyer',
    clientEmail: 'ananya.iyer@example.com',
    clientPhone: '+91 99887 77665',
    organization: 'Iyer Digital Labs',
    designation: 'Founder',
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
    documents: [
      ...BASE_DOCUMENTS.slice(0, 2),
      { id: 'doc-udyam', fieldName: 'Udyam Registration', file: null },
    ],
    notes: '',
  },
  {
    id: 'project-organic-fertilizer',
    projectTitle: 'Organic Fertilizer Unit',
    projectDescription: 'Manufacturing unit for organic fertilizers and soil enrichment products.',
    status: 'Awaiting Documents',
    lastUpdated: '10 September 2024, 02:20 PM',
    submittedByType: 'Self',
    clientName: 'Rohan Mehta',
    clientEmail: 'rohan.mehta@example.com',
    clientPhone: '+91 91234 56780',
    organization: 'Mehta Agro Inputs',
    designation: 'Partner',
    sectionCode: 'C',
    sectionName: 'Manufacturing',
    divisionCode: '20',
    divisionName: 'Manufacture of chemicals and chemical products',
    groupCode: '202',
    groupName: 'Manufacture of other chemical products',
    classCode: '2021',
    className: 'Manufacture of pesticides and other agrochemical products',
    nicCode: '23999',
    nicName: 'Manufacture of other non-metallic mineral products',
    documents: BASE_DOCUMENTS.map((document) => ({ ...document, file: null })),
    notes: 'Awaiting land documents and provisional financials.',
  },
]

let projectStore = INITIAL_PROJECTS.map((project) => ({
  ...project,
  documents: project.documents.map((document) => ({
    ...document,
    file: document.file ? { ...document.file } : null,
  })),
}))

export function getProjects() {
  return projectStore.map((project) => ({
    ...project,
    documents: project.documents.map((document) => ({
      ...document,
      file: document.file ? { ...document.file } : null,
    })),
  }))
}

export function getProjectById(projectId) {
  return getProjects().find((project) => project.id === projectId)
}

export function updateProject(projectId, updater) {
  projectStore = projectStore.map((project) =>
    project.id === projectId ? updater(project) : project,
  )
  return getProjectById(projectId)
}
