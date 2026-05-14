// Direct-to-Firestore form submissions. No backend required.
//
// Each helper writes to the corresponding admin collection so that admin
// snapshot listeners pick up the new submission immediately.

import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { uploadToCloudinary } from './cloudinary'

const ACTIVE_BUSINESS_ASSOCIATE_STATUSES = new Set([
  'Inquiry Submitted',
  'Verification In progress',
  'Verified',
])

const submitterMeta = (type = 'Self') => {
  const user = auth.currentUser
  return {
    submittedBy: user
      ? {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || '',
          provider: user.providerData?.[0]?.providerId || 'password',
        }
      : null,
    submittedByType: type,
    submittedAt: serverTimestamp(),
  }
}

export const submitContactInquiry = async (fields) => {
  const ref = await addDoc(collection(db, 'contactInquiries'), {
    name: (fields.name || '').trim(),
    email: (fields.email || '').trim().toLowerCase(),
    mobile: (fields.mobile || '').trim(),
    subject: (fields.subject || '').trim(),
    message: (fields.message || '').trim(),
    status: 'New',
    notes: '',
    ...submitterMeta(),
  })
  return { id: ref.id }
}

export const submitProjectInquiry = async (fields) => {
  const type = fields.submittedByType || 'Self'
  const ref = await addDoc(collection(db, 'selectProjectSubmissions'), {
    projectTitle: (fields.projectTitle || '').trim(),
    projectDescription: (fields.projectDescription || '').trim(),
    projectSection: fields.projectSection || '',
    projectDivision: fields.projectDivision || '',
    projectGroup: fields.projectGroup || '',
    projectClass: fields.projectClass || '',
    nicCode: fields.nicCode || '',
    status: 'Inquiry Pending',
    notes: '',
    documents: [],
    history: [],
    // Associate / Client fields
    clientName: fields.clientName || '',
    clientPhone: fields.clientPhone || '',
    associateName: fields.associateName || '',
    associateEmail: fields.associateEmail || '',
    ...submitterMeta(type),
  })
  return { id: ref.id }
}

export const submitInvestorApplication = async ({ fields, files }) => {
  const aadhaarUpload = files?.aadhaarFile
    ? await uploadToCloudinary(
        files.aadhaarFile,
        'startupcredit/investors/aadhaar'
      )
    : null
  const panUpload = files?.panFile
    ? await uploadToCloudinary(files.panFile, 'startupcredit/investors/pan')
    : null

  const ref = await addDoc(collection(db, 'investorApplications'), {
    investorType: fields.investorType || 'individual',
    investorName: (fields.investorName || '').trim(),
    email: (fields.email || '').trim().toLowerCase(),
    phone: (fields.phone || '').trim(),
    entityType: fields.entityType || '',
    checkSize: fields.checkSize || '',
    aadhaarNumber: fields.aadhaarNumber || '',
    panNumber: fields.panNumber || '',
    aadhaarDocument: aadhaarUpload,
    panDocument: panUpload,
    status: 'Inquiry Submitted',
    notes: '',
    reviewedOn: '',
    reviewedBy: '',
    ...submitterMeta(),
  })
  return { id: ref.id }
}

const getBusinessAssociateStatusRank = (status) => {
  if (status === 'Verified') return 4
  if (status === 'Verification In progress') return 3
  if (status === 'Inquiry Submitted') return 2
  if (status === 'Rejected') return 1
  return 0
}

export const fetchExistingBusinessAssociateApplication = async ({ uid, email } = {}) => {
  const normalizedEmail = (email || '').trim().toLowerCase()
  const applicationsById = new Map()

  if (uid) {
    const uidSnap = await getDocs(query(
      collection(db, 'businessAssociateApplications'),
      where('submittedBy.uid', '==', uid)
    ))
    uidSnap.docs.forEach((docSnap) => {
      applicationsById.set(docSnap.id, { id: docSnap.id, ...docSnap.data() })
    })
  }

  if (normalizedEmail && applicationsById.size === 0) {
    try {
      const emailSnap = await getDocs(query(
        collection(db, 'businessAssociateApplications'),
        where('email', '==', normalizedEmail)
      ))
      emailSnap.docs.forEach((docSnap) => {
        applicationsById.set(docSnap.id, { id: docSnap.id, ...docSnap.data() })
      })
    } catch (err) {
      if (err?.code !== 'permission-denied') throw err
    }
  }

  const applications = Array.from(applicationsById.values())
  if (applications.length === 0) return null

  return applications.sort((a, b) => (
    getBusinessAssociateStatusRank(b.status) - getBusinessAssociateStatusRank(a.status)
  ))[0]
}

const blockDuplicateBusinessAssociateApplication = async (fields) => {
  const user = auth.currentUser
  if (user?.uid) {
    const userSnap = await getDoc(doc(db, 'users', user.uid))
    if (userSnap.exists() && userSnap.data()?.role === 'Associate') {
      const err = new Error('You are already a verified business associate.')
      err.code = 'duplicate-business-associate-application'
      err.status = 'Verified'
      throw err
    }
  }

  const existing = await fetchExistingBusinessAssociateApplication({
    uid: user?.uid,
    email: fields?.email || user?.email,
  })

  if (!existing || existing.status === 'Rejected') return

  const message =
    existing.status === 'Verified'
      ? 'You are already a verified business associate.'
      : 'Your business associate application is already under review.'
  const err = new Error(message)
  err.code = 'duplicate-business-associate-application'
  err.status = existing.status
  throw err
}

export const submitBusinessAssociateApplication = async ({ fields, files }) => {
  await blockDuplicateBusinessAssociateApplication(fields)

  const aadhaarUpload = files?.aadhaarFile
    ? await uploadToCloudinary(
        files.aadhaarFile,
        'startupcredit/business-associates/aadhaar'
      )
    : null
  const panUpload = files?.panFile
    ? await uploadToCloudinary(
        files.panFile,
        'startupcredit/business-associates/pan'
      )
    : null

  const ref = await addDoc(collection(db, 'businessAssociateApplications'), {
    firstName: (fields.firstName || '').trim(),
    middleName: (fields.middleName || '').trim(),
    lastName: (fields.lastName || '').trim(),
    email: (fields.email || '').trim().toLowerCase(),
    mobile: (fields.mobile || '').trim(),
    profession: (fields.profession || '').trim(),
    dob: fields.dob || '',
    educationalStatus: fields.educationalStatus || '',
    aadhaarNumber: (fields.aadhaarNumber || '').trim(),
    panNumber: (fields.panNumber || '').trim(),
    bankAccount: (fields.bankAccount || '').trim(),
    ifscCode: (fields.ifscCode || '').trim(),
    upiId: (fields.upiId || '').trim(),
    aadhaarDocument: aadhaarUpload,
    panDocument: panUpload,
    status: 'Inquiry Submitted',
    notes: '',
    ...submitterMeta(),
  })
  return { id: ref.id }
}
