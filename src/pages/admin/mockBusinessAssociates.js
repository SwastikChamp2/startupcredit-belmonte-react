const INITIAL_BUSINESS_ASSOCIATES = [
  {
    id: 'BA-001',
    firstName: 'Rahul',
    middleName: '',
    lastName: 'Sharma',
    email: 'rahul.sharma@example.com',
    mobile: '+91 98765 43210',
    profession: 'Financial Consultant',
    dob: '15 August 1990',
    educationalStatus: 'Graduate',
    aadhaarNumber: '9876 5432 1098',
    panNumber: 'AABPK1234K',
    bankAccount: '123456789012',
    ifscCode: 'HDFC0001234',
    upiId: 'rahul@upi',
    status: 'Inquiry Submitted',
    appliedOn: '12 May 2024, 10:30 AM',
    avatar: 'RS',
    notes: 'Applicant has prior loan consultancy experience.',
    documents: [
      { id: 'doc-aadhaar', fieldName: 'Aadhaar Card', file: null },
      { id: 'doc-pan', fieldName: 'PAN Card', file: { name: 'rahul_pan.pdf', type: 'PDF', uploadedOn: '12 May 2024, 10:35 AM' } },
    ],
  },
  {
    id: 'BA-002',
    firstName: 'Anjali',
    middleName: '',
    lastName: 'Patel',
    email: 'anjali.patel@example.com',
    mobile: '+91 91234 56789',
    profession: 'Business Advisor',
    dob: '22 January 1988',
    educationalStatus: 'Post Graduate',
    aadhaarNumber: '8765 4321 0987',
    panNumber: 'BHPKP5678L',
    bankAccount: '234567890123',
    ifscCode: 'ICIC0002345',
    upiId: 'anjali@upi',
    status: 'Verification In progress',
    appliedOn: '11 May 2024, 04:15 PM',
    avatar: 'AP',
    notes: '',
    documents: [
      { id: 'doc-aadhaar', fieldName: 'Aadhaar Card', file: { name: 'anjali_aadhaar.pdf', type: 'PDF', uploadedOn: '11 May 2024, 04:20 PM' } },
      { id: 'doc-pan', fieldName: 'PAN Card', file: null },
    ],
  },
  {
    id: 'BA-003',
    firstName: 'Vikram',
    middleName: '',
    lastName: 'Kumar',
    email: 'vikram.kumar@example.com',
    mobile: '+91 99887 66554',
    profession: 'Business Consultant',
    dob: '15 August 1990',
    educationalStatus: 'Graduate',
    aadhaarNumber: '9876 5432 1098',
    panNumber: 'AABFK1234K',
    bankAccount: '345678901234',
    ifscCode: 'SBIN0003456',
    upiId: 'vikram@upi',
    status: 'Verified',
    appliedOn: '10 May 2024, 11:20 AM',
    avatar: 'VK',
    notes: 'All documents verified. Associate is genuine and can be onboarded.',
    documents: [
      { id: 'doc-aadhaar', fieldName: 'Aadhaar Card', file: { name: 'vikram_aadhaar.pdf', type: 'PDF', uploadedOn: '10 May 2024, 11:25 AM' } },
      { id: 'doc-pan', fieldName: 'PAN Card', file: { name: 'vikram_pan.pdf', type: 'PDF', uploadedOn: '10 May 2024, 11:26 AM' } },
    ],
  },
  {
    id: 'BA-004',
    firstName: 'Neha',
    middleName: '',
    lastName: 'Pandey',
    email: 'neha.pandey@example.com',
    mobile: '+91 90909 09090',
    profession: 'Sales Manager',
    dob: '09 March 1992',
    educationalStatus: 'Post Graduate',
    aadhaarNumber: '7654 3210 9876',
    panNumber: 'DDKPP3456N',
    bankAccount: '456789012345',
    ifscCode: 'AXIS0004567',
    upiId: 'neha@upi',
    status: 'Inquiry Submitted',
    appliedOn: '09 May 2024, 09:45 AM',
    avatar: 'NP',
    notes: '',
    documents: [
      { id: 'doc-aadhaar', fieldName: 'Aadhaar Card', file: null },
      { id: 'doc-pan', fieldName: 'PAN Card', file: null },
    ],
  },
  {
    id: 'BA-005',
    firstName: 'Arjun',
    middleName: '',
    lastName: 'Singh',
    email: 'arjun.singh@example.com',
    mobile: '+91 77665 44332',
    profession: 'Loan Advisor',
    dob: '27 July 1987',
    educationalStatus: 'Graduate',
    aadhaarNumber: '6543 2109 8765',
    panNumber: 'EEVPS7890P',
    bankAccount: '567890123456',
    ifscCode: 'KKBK0005678',
    upiId: 'arjun@upi',
    status: 'Verification In progress',
    appliedOn: '08 May 2024, 03:30 PM',
    avatar: 'AS',
    notes: 'PAN file pending review.',
    documents: [
      { id: 'doc-aadhaar', fieldName: 'Aadhaar Card', file: { name: 'arjun_aadhaar.pdf', type: 'PDF', uploadedOn: '08 May 2024, 03:45 PM' } },
      { id: 'doc-pan', fieldName: 'PAN Card', file: null },
    ],
  },
  {
    id: 'BA-006',
    firstName: 'Pooja',
    middleName: '',
    lastName: 'Shah',
    email: 'pooja.shah@example.com',
    mobile: '+91 84567 89012',
    profession: 'Chartered Accountant',
    dob: '04 December 1985',
    educationalStatus: 'Post Graduate',
    aadhaarNumber: '5432 1098 7654',
    panNumber: 'FFVPS2345Q',
    bankAccount: '678901234567',
    ifscCode: 'YESB0006789',
    upiId: 'pooja@upi',
    status: 'Verified',
    appliedOn: '07 May 2024, 02:10 PM',
    avatar: 'PS',
    notes: 'Strong referral network in SME segment.',
    documents: [
      { id: 'doc-aadhaar', fieldName: 'Aadhaar Card', file: { name: 'pooja_aadhaar.pdf', type: 'PDF', uploadedOn: '07 May 2024, 02:18 PM' } },
      { id: 'doc-pan', fieldName: 'PAN Card', file: { name: 'pooja_pan.pdf', type: 'PDF', uploadedOn: '07 May 2024, 02:20 PM' } },
    ],
  },
]

let businessAssociateStore = INITIAL_BUSINESS_ASSOCIATES.map((associate) => ({
  ...associate,
  documents: associate.documents.map((document) => ({
    ...document,
    file: document.file ? { ...document.file } : null,
  })),
}))

export function getBusinessAssociates() {
  return businessAssociateStore.map((associate) => ({
    ...associate,
    documents: associate.documents.map((document) => ({
      ...document,
      file: document.file ? { ...document.file } : null,
    })),
  }))
}

export function getBusinessAssociateById(associateId) {
  return getBusinessAssociates().find((associate) => associate.id === associateId)
}

export function updateBusinessAssociate(associateId, updater) {
  businessAssociateStore = businessAssociateStore.map((associate) =>
    associate.id === associateId ? updater(associate) : associate,
  )
  return getBusinessAssociateById(associateId)
}

export function getAssociateFullName(associate) {
  return [associate.firstName, associate.middleName, associate.lastName]
    .filter(Boolean)
    .join(' ')
}
