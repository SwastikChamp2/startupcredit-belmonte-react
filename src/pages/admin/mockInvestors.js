const INITIAL_INVESTORS = [
  {
    id: 'INV-001',
    investorType: 'Organisation',
    name: 'Mehta Capital Advisors',
    email: 'arjun.mehta@example.com',
    phone: '+91 98765 43210',
    status: 'Inquiry Submitted',
    appliedOn: '12 May 2024, 10:30 AM',
    avatar: 'MC',
    entityType: 'Private Limited',
    checkSize: '1 - 5 Crores',
    aadhaar: '-',
    pan: 'AABFK1234K',
    reviewedOn: '13 May 2024, 02:45 PM',
    reviewedBy: 'Admin User',
    notes: 'Investor seems interested in Series A startups. Documents verified.',
    documents: [
      { id: 'doc1', name: 'PAN Card', type: 'PDF', uploadedOn: '10 May 2024, 11:25 AM' },
      { id: 'doc2', name: 'Certificate of Incorporation', type: 'PDF', uploadedOn: '10 May 2024, 11:27 AM' },
      { id: 'doc3', name: 'Financial Statements (FY 23-24)', type: 'XLSX', uploadedOn: '10 May 2024, 11:30 AM' },
      { id: 'doc4', name: 'Company Profile', type: 'DOC', uploadedOn: '10 May 2024, 11:32 AM' },
      { id: 'doc5', name: 'Cancelled Cheque', type: 'JPG', uploadedOn: '10 May 2024, 11:35 AM' }
    ]
  },
  {
    id: 'INV-002',
    investorType: 'Organisation',
    name: 'Shah Investment Group',
    email: 'priya.shah@example.com',
    phone: '+91 91234 56789',
    status: 'Verification In progress',
    appliedOn: '11 May 2024, 04:15 PM',
    avatar: 'SI',
    entityType: 'Partnership',
    checkSize: '50 Lakhs - 1 Crore',
    aadhaar: '-',
    pan: 'BHPKS5678L',
    reviewedOn: '-',
    reviewedBy: '-',
    notes: '',
    documents: [
      { id: 'doc1', name: 'PAN Card', type: 'PDF', uploadedOn: '11 May 2024, 04:20 PM' },
      { id: 'doc2', name: 'Partnership Deed', type: 'PDF', uploadedOn: '11 May 2024, 04:22 PM' }
    ]
  },
  {
    id: 'INV-003',
    investorType: 'Individual',
    name: 'Rakesh Kumar',
    email: 'rakesh.kumar@example.com',
    phone: '+91 99887 66554',
    status: 'Verified',
    appliedOn: '10 May 2024, 11:20 AM',
    avatar: 'RK',
    entityType: '-',
    checkSize: '10 - 50 Lakhs',
    aadhaar: '1234 5678 9012',
    pan: 'CCVPL9012M',
    reviewedOn: '13 May 2024, 02:45 PM',
    reviewedBy: 'Admin User',
    notes: 'All documents verified. Investor is genuine and can be onboarded.',
    documents: [
      { id: 'doc1', name: 'PAN Card', type: 'PDF', uploadedOn: '10 May 2024, 11:25 AM' },
      { id: 'doc2', name: 'Aadhaar Card', type: 'PDF', uploadedOn: '10 May 2024, 11:27 AM' },
      { id: 'doc3', name: 'Cancelled Cheque', type: 'JPG', uploadedOn: '10 May 2024, 11:35 AM' }
    ]
  },
  {
    id: 'INV-004',
    investorType: 'Organisation',
    name: 'Desai Ventures',
    email: 'neha.desai@example.com',
    phone: '+91 90909 09090',
    status: 'Inquiry Submitted',
    appliedOn: '09 May 2024, 09:45 AM',
    avatar: 'DV',
    entityType: 'VC Firm',
    checkSize: '5 - 10 Crores',
    aadhaar: '-',
    pan: 'DDKPS3456N',
    reviewedOn: '-',
    reviewedBy: '-',
    notes: '',
    documents: [
      { id: 'doc1', name: 'PAN Card', type: 'PDF', uploadedOn: '09 May 2024, 10:00 AM' }
    ]
  },
  {
    id: 'INV-005',
    investorType: 'Individual',
    name: 'Suresh Modi',
    email: 'suresh.modi@example.com',
    phone: '+91 88001 12233',
    status: 'Verification In progress',
    appliedOn: '08 May 2024, 03:30 PM',
    avatar: 'SM',
    entityType: '-',
    checkSize: '10 - 50 Lakhs',
    aadhaar: '9876 5432 1098',
    pan: 'EEVPS7890P',
    reviewedOn: '-',
    reviewedBy: '-',
    notes: '',
    documents: [
      { id: 'doc1', name: 'PAN Card', type: 'PDF', uploadedOn: '08 May 2024, 03:45 PM' },
      { id: 'doc2', name: 'Aadhaar Card', type: 'PDF', uploadedOn: '08 May 2024, 03:50 PM' }
    ]
  },
  {
    id: 'INV-006',
    investorType: 'Organisation',
    name: 'Kapoor Investments',
    email: 'vikram.kapoor@example.com',
    phone: '+91 77665 44332',
    status: 'Verified',
    appliedOn: '07 May 2024, 02:10 PM',
    avatar: 'KI',
    entityType: 'Angel Syndicate',
    checkSize: '1 - 5 Crores',
    aadhaar: '-',
    pan: 'FFVPL2345Q',
    reviewedOn: '12 May 2024, 11:30 AM',
    reviewedBy: 'Admin User',
    notes: 'Solid track record. Onboarding complete.',
    documents: [
      { id: 'doc1', name: 'PAN Card', type: 'PDF', uploadedOn: '07 May 2024, 02:30 PM' },
      { id: 'doc2', name: 'COI', type: 'PDF', uploadedOn: '07 May 2024, 02:35 PM' }
    ]
  }
]

let investorStore = [...INITIAL_INVESTORS]

export function getInvestors() {
  return investorStore
}

export function updateInvestor(investorId, updater) {
  investorStore = investorStore.map(inv => inv.id === investorId ? updater(inv) : inv)
  return investorStore.find(inv => inv.id === investorId)
}

export const mockInvestors = investorStore;
