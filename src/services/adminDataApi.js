// Direct Firestore admin operations — no backend required.
//
// All writes happen through the Firebase client SDK and are gated by the
// Firestore security rules. The admin's writes work only when their Firebase
// Auth token has the `admin: true` custom claim (see backend/scripts/setAdminClaim.mjs).

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
// Admin operations must use the admin Firestore instance (tied to adminAuth)
// so writes carry the admin's custom-claim token. The public `db` is for the
// public site (forms / user signup / public reads of reference data).
import { adminDb as db } from '../firebase'
import { uploadToCloudinary } from './cloudinary'

/* -------------------- Document viewer / download helpers -------------------- */

const OFFICE_EXTS = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'])
const OFFICE_TYPE_LABELS = new Set(['word', 'excel', 'powerpoint'])

const detectExtension = (file) => {
  const fromName = (file?.name || '').split('.').pop()?.toLowerCase() || ''
  if (fromName) return fromName
  return (file?.type || '').toLowerCase()
}

export const documentViewerUrl = (file) => {
  if (!file?.url) return null
  const ext = detectExtension(file)
  if (OFFICE_EXTS.has(ext) || OFFICE_TYPE_LABELS.has(ext)) {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(file.url)}`
  }
  return file.url
}

export const documentDownloadUrl = (file) => {
  if (!file?.url) return null
  if (file.url.includes('/upload/')) {
    return file.url.replace('/upload/', '/upload/fl_attachment/')
  }
  return file.url
}

export const documentIconClass = (file) => {
  const ext = detectExtension(file)
  if (ext === 'pdf') return 'fa-solid fa-file-pdf'
  if (['xls', 'xlsx', 'excel', 'csv'].includes(ext)) return 'fa-solid fa-file-excel'
  if (['doc', 'docx', 'word'].includes(ext)) return 'fa-solid fa-file-word'
  if (['ppt', 'pptx', 'powerpoint'].includes(ext)) return 'fa-solid fa-file-powerpoint'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'fa-solid fa-file-image'
  return 'fa-solid fa-file-lines'
}

/* -------------------- File upload (admin) -------------------- */

// Wrapper around the Cloudinary helper used by admin pages. Default folder
// can be overridden by callers (e.g. project-specific folders).
export const uploadAdminFile = (file, folder = 'startupcredit/admin-uploads') =>
  uploadToCloudinary(file, folder)

/* -------------------- Display helpers -------------------- */

export const formatTimestamp = (ts) => {
  if (!ts) return ''
  // Firestore Timestamp shape (REST): { _seconds, _nanoseconds }
  // Firestore SDK shape: object with .seconds and .toDate()
  const seconds = ts._seconds ?? ts.seconds ?? null
  if (typeof seconds === 'number') {
    return new Date(seconds * 1000).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  if (ts instanceof Date) return ts.toLocaleString('en-IN')
  if (typeof ts.toDate === 'function') return ts.toDate().toLocaleString('en-IN')
  const date = new Date(ts)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-IN')
}

// Recursively drop `undefined` from any payload before it hits Firestore
// (Firestore rejects docs containing undefined anywhere). Replaces with `null`
// inside arrays so positions don't shift; drops the key entirely in objects.
// Skips Firestore sentinels (FieldValue / Timestamp) so serverTimestamp()
// passes through unchanged.
const isFirestoreSentinel = (value) => {
  if (!value || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  const name = proto?.constructor?.name || ''
  return (
    name === 'Timestamp' ||
    name === 'GeoPoint' ||
    name === 'DocumentReference' ||
    name.endsWith('FieldValue') ||
    name.endsWith('FieldValueImpl')
  )
}

const sanitize = (value) => {
  if (value === undefined) return null
  if (value === null) return null
  if (Array.isArray(value)) return value.map(sanitize)
  if (typeof value === 'object') {
    if (isFirestoreSentinel(value)) return value
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue
      out[k] = sanitize(v)
    }
    return out
  }
  return value
}

const stamped = (patch) => ({
  ...sanitize(patch),
  updatedAt: serverTimestamp(),
})

const docsToArray = (snapshot) =>
  snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() }))

/* -------------------- Users -------------------- */

export const adaptUserForAdmin = (raw) => {
  if (!raw) return null
  const fallbackName = (raw.email || '').split('@')[0] || 'Unnamed user'
  return {
    id: raw.id || raw.uid,
    name: (raw.name || '').trim() || fallbackName,
    email: raw.email || '',
    provider: raw.provider || 'password',
    createdAt: formatTimestamp(raw.createdAt),
    status: raw.disabled ? 'Disabled' : 'Active',
  }
}

export const fetchAdminUsers = async () => {
  const snap = await getDocs(collection(db, 'users'))
  return docsToArray(snap).map(adaptUserForAdmin)
}

export const setAdminUserDisabled = (id, disabled) =>
  updateDoc(doc(db, 'users', id), stamped({ disabled }))

export const setAdminUserRole = (id, role) =>
  updateDoc(doc(db, 'users', id), stamped({ role }))

export const findUserByEmail = async (email) => {
  const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export const deleteAdminUser = (id) => deleteDoc(doc(db, 'users', id))

/* -------------------- Submissions: helpers -------------------- */

const splitCodeLabel = (value) => {
  if (!value) return { code: '', name: '' }
  const idx = value.indexOf(' - ')
  if (idx < 0) return { code: value, name: '' }
  return { code: value.slice(0, idx), name: value.slice(idx + 3) }
}

const joinCodeLabel = (prefix, code, name, fallback = '') => {
  if (fallback) return fallback
  if (!code && !name) return ''
  return `${prefix} ${code || ''}${code && name ? ' - ' : ''}${name || ''}`.trim()
}

const initialsOf = (name) => {
  const cleanName = String(name || '').trim()
  if (!cleanName) return 'NA'
  const words = cleanName.split(/\s+/)
  if (words.length === 1) {
    // If it's a single word and all caps (abbreviation), use it up to 4 chars
    if (words[0] === words[0].toUpperCase() && words[0].length <= 4) {
      return words[0]
    }
    return words[0].slice(0, 2).toUpperCase()
  }
  return words
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const submitterDisplay = (raw) => {
  const sb = raw.submittedBy || {}
  const fallback = (sb.email || '').split('@')[0]
  return {
    name: sb.name || fallback || 'Anonymous',
    email: sb.email || '',
  }
}

const normalizeProjectSubmissionType = (type) =>
  type === 'Business Associate' || type === 'Associate' ? 'Associate' : 'Self'

export const fetchAdminNicData = async () => {
  const [sectionsSnap, allCodesSnap] = await Promise.all([
    getDocs(collection(db, 'nicSections')),
    getDoc(doc(db, 'staticData', 'nicAllCodes')),
  ])
  const nicDataFull = docsToArray(sectionsSnap).sort((a, b) =>
    String(a.code).localeCompare(String(b.code))
  )
  const allNicCodes = allCodesSnap.exists()
    ? allCodesSnap.data().allNicCodes || []
    : []
  return { nicDataFull, allNicCodes }
}

/* -------------------- Project submissions -------------------- */

export const adaptProjectForAdmin = (raw) => {
  if (!raw) return null
  const section = splitCodeLabel(raw.projectSection)
  const division = splitCodeLabel(raw.projectDivision)
  const group = splitCodeLabel(raw.projectGroup)
  const cls = splitCodeLabel(raw.projectClass)
  const nic = splitCodeLabel(raw.nicCode)
  const submitter = submitterDisplay(raw)
  const sectionLabel = joinCodeLabel('Section', section.code || raw.sectionCode, section.name || raw.sectionName, raw.projectSection)
  const divisionLabel = joinCodeLabel('Division', division.code || raw.divisionCode, division.name || raw.divisionName, raw.projectDivision)
  const groupLabel = joinCodeLabel('Group', group.code || raw.groupCode, group.name || raw.groupName, raw.projectGroup)
  const classLabel = joinCodeLabel('Class', cls.code || raw.classCode, cls.name || raw.className, raw.projectClass)
  const nicLabel = joinCodeLabel('NIC', nic.code || raw.nicCode, nic.name || raw.nicName, raw.nicCode)

  return {
    id: raw.id,
    projectTitle: raw.projectTitle || '',
    projectDescription: raw.projectDescription || '',
    projectSection: sectionLabel,
    projectDivision: divisionLabel,
    projectGroup: groupLabel,
    projectClass: classLabel,
    projectNicCode: nicLabel,
    sectionCode: section.code || raw.sectionCode || '',
    sectionName: section.name || raw.sectionName || '',
    divisionCode: division.code || raw.divisionCode || '',
    divisionName: division.name || raw.divisionName || '',
    groupCode: group.code || raw.groupCode || '',
    groupName: group.name || raw.groupName || '',
    classCode: cls.code || raw.classCode || '',
    className: cls.name || raw.className || '',
    nicCode: nic.code || raw.nicCode || '',
    nicName: nic.name || raw.nicName || '',
    status: raw.status || 'Inquiry Pending',
    createdAt: formatTimestamp(raw.submittedAt),
    lastUpdated: formatTimestamp(raw.updatedAt || raw.submittedAt),
    submittedByType: normalizeProjectSubmissionType(raw.submittedByType),
    creatorName: submitter.name,
    creatorEmail: submitter.email,
    associateName: raw.associateName || '',
    associateEmail: raw.associateEmail || '',
    clientName: raw.clientName || submitter.name,
    clientEmail: raw.clientEmail || submitter.email,
    clientPhone: raw.clientPhone || '',
    notes: raw.notes || '',
    documents: Array.isArray(raw.documents) ? raw.documents : [],
    history: Array.isArray(raw.history) ? raw.history : [],
  }
}

export const fetchAdminProjectSubmissions = async () => {
  const snap = await getDocs(collection(db, 'selectProjectSubmissions'))
  return docsToArray(snap).map(adaptProjectForAdmin)
}

export const fetchAdminProjectSubmission = async (id) => {
  const snap = await getDoc(doc(db, 'selectProjectSubmissions', id))
  if (!snap.exists()) return null
  return adaptProjectForAdmin({ id: snap.id, ...snap.data() })
}

export const updateAdminProjectSubmission = (id, patch) =>
  updateDoc(doc(db, 'selectProjectSubmissions', id), stamped(patch))

export const deleteAdminProjectSubmission = (id) =>
  deleteDoc(doc(db, 'selectProjectSubmissions', id))

/* -------------------- Investor applications -------------------- */

const documentFromCloudinary = (id, fieldName, fileDoc) =>
  fileDoc
    ? {
        id,
        fieldName,
        file: {
          name: fileDoc.originalName || fileDoc.originalFilename || `${fieldName}.${fileDoc.format || 'file'}`,
          type: (fileDoc.format || '').toUpperCase() || 'FILE',
          url: fileDoc.url || '',
          publicId: fileDoc.publicId || '',
          size: fileDoc.bytes ? `${Math.max(1, Math.round(fileDoc.bytes / 1024))} KB` : '',
          uploadedOn: '',
        },
      }
    : { id, fieldName, file: null }

export const adaptInvestorForAdmin = (raw) => {
  if (!raw) return null
  return {
    id: raw.id,
    investorType: raw.investorType === 'organisation' ? 'Organisation' : 'Individual',
    name: raw.investorName || '',
    email: raw.email || '',
    phone: raw.phone || '',
    avatar: initialsOf(raw.investorName),
    entityType: raw.entityType || '-',
    checkSize: raw.checkSize || '',
    aadhaar: raw.aadhaarNumber || '-',
    pan: raw.panNumber || '-',
    status: raw.status || 'Inquiry Submitted',
    appliedOn: formatTimestamp(raw.submittedAt),
    reviewedOn: raw.reviewedOn || '-',
    reviewedBy: raw.reviewedBy || '-',
    notes: raw.notes || '',
    documents: [
      documentFromCloudinary('doc-aadhaar', 'Aadhaar Card', raw.aadhaarDocument),
      documentFromCloudinary('doc-pan', 'PAN Card', raw.panDocument),
      ...(Array.isArray(raw.documents) ? raw.documents : []),
    ],
  }
}

export const fetchAdminInvestors = async () => {
  const snap = await getDocs(collection(db, 'investorApplications'))
  return docsToArray(snap).map(adaptInvestorForAdmin)
}

export const fetchAdminInvestor = async (id) => {
  const snap = await getDoc(doc(db, 'investorApplications', id))
  if (!snap.exists()) return null
  return adaptInvestorForAdmin({ id: snap.id, ...snap.data() })
}

export const updateAdminInvestor = (id, patch) =>
  updateDoc(doc(db, 'investorApplications', id), stamped(patch))

export const deleteAdminInvestor = (id) =>
  deleteDoc(doc(db, 'investorApplications', id))

/* -------------------- Business associate applications -------------------- */

export const adaptBusinessAssociateForAdmin = (raw) => {
  if (!raw) return null
  const fullName = [raw.firstName, raw.middleName, raw.lastName].filter(Boolean).join(' ')
  return {
    id: raw.id,
    firstName: raw.firstName || '',
    middleName: raw.middleName || '',
    lastName: raw.lastName || '',
    email: raw.email || '',
    mobile: raw.mobile || '',
    profession: raw.profession || '',
    dob: raw.dob || '',
    educationalStatus: raw.educationalStatus || '',
    aadhaarNumber: raw.aadhaarNumber || '',
    panNumber: raw.panNumber || '',
    bankAccount: raw.bankAccount || '',
    ifscCode: raw.ifscCode || '',
    upiId: raw.upiId || '',
    status: raw.status || 'Inquiry Submitted',
    appliedOn: formatTimestamp(raw.submittedAt),
    avatar: initialsOf(fullName),
    notes: raw.notes || '',
    documents: [
      documentFromCloudinary('doc-aadhaar', 'Aadhaar Card', raw.aadhaarDocument),
      documentFromCloudinary('doc-pan', 'PAN Card', raw.panDocument),
      ...(Array.isArray(raw.documents) ? raw.documents : []),
    ],
    submittedByUid: raw.submittedBy?.uid || '',
  }
}

export const fetchAdminBusinessAssociates = async () => {
  const snap = await getDocs(collection(db, 'businessAssociateApplications'))
  return docsToArray(snap).map(adaptBusinessAssociateForAdmin)
}

export const fetchAdminBusinessAssociate = async (id) => {
  const snap = await getDoc(doc(db, 'businessAssociateApplications', id))
  if (!snap.exists()) return null
  return adaptBusinessAssociateForAdmin({ id: snap.id, ...snap.data() })
}

export const updateAdminBusinessAssociate = (id, patch) =>
  updateDoc(doc(db, 'businessAssociateApplications', id), stamped(patch))

export const deleteAdminBusinessAssociate = (id) =>
  deleteDoc(doc(db, 'businessAssociateApplications', id))

export const getAssociateFullName = (associate) =>
  [associate?.firstName, associate?.middleName, associate?.lastName].filter(Boolean).join(' ')

/* -------------------- Contact inquiries -------------------- */

export const adaptContactInquiryForAdmin = (raw) => {
  if (!raw) return null
  return {
    id: raw.id,
    name: raw.name || '',
    email: raw.email || '',
    mobile: raw.mobile || '',
    subject: raw.subject || '',
    message: raw.message || '',
    status: raw.status || 'New',
    submittedAt: formatTimestamp(raw.submittedAt),
    notes: raw.notes || '',
  }
}

export const fetchAdminContactInquiries = async () => {
  const snap = await getDocs(collection(db, 'contactInquiries'))
  return docsToArray(snap).map(adaptContactInquiryForAdmin)
}

export const updateAdminContactInquiry = (id, patch) =>
  updateDoc(doc(db, 'contactInquiries', id), stamped(patch))

export const deleteAdminContactInquiry = (id) =>
  deleteDoc(doc(db, 'contactInquiries', id))

/* -------------------- Services (admin CRUD) -------------------- */

const buildSectionLookup = (sections) => {
  const idToTitle = {}
  const titleToId = {}
  for (const section of sections) {
    idToTitle[section.id] = section.title
    titleToId[section.title] = section.id
  }
  return { idToTitle, titleToId }
}

export const adaptServiceForAdmin = (raw, sectionLookup) => {
  if (!raw) return null
  const sectionTitle = sectionLookup?.idToTitle?.[raw.sectionId] || raw.sectionId || ''
  return {
    id: raw.id || raw.scheme,
    name: raw.title || raw.name || '',
    slug: raw.scheme || raw.id || '',
    category: raw.category || sectionTitle,
    sectionId: raw.sectionId || sectionLookup?.titleToId?.[raw.category] || '',
    status: raw.status || 'Published',
    order: raw.sortOrder ?? raw.order ?? 0,
    lastUpdated: formatTimestamp(raw.updatedAt),
    image: raw.image || '',
    alt: raw.alt || raw.name || '',
    shortDescription: raw.description || raw.shortDescription || '',
    highlights: raw.highlights || [],
    content: raw.content || raw.page_body || '',
    ourApproach: raw.ourApproach || raw.our_approach_body || '',
    faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
    featureImage1: raw.featureImage1 || '',
    featureImage2: raw.featureImage2 || '',
    seoTitle: raw.seoTitle || '',
    seoDescription: raw.seoDescription || '',
    sources: [
      ...(Array.isArray(raw.sources) ? raw.sources : []),
      ...(Array.isArray(raw.download_files) ? raw.download_files.map(f => ({ 
        title: f.title || 'Download', 
        url: f.href || f.url || '', 
        type: 'file' 
      })) : [])
    ],
  }
}

const adminServicePayload = (form, sectionLookup) => ({
  scheme: form.slug,
  title: form.name,
  description: form.shortDescription,
  image: form.image,
  alt: form.alt || form.name,
  sectionId: form.sectionId || sectionLookup?.titleToId?.[form.category] || form.category,
  sortOrder: Number.parseInt(form.order, 10) || 0,
  status: form.status || 'Published',
  highlights: Array.isArray(form.highlights) ? form.highlights.filter(Boolean) : [],
  content: form.content || '',
  ourApproach: form.ourApproach || '',
  faqs: Array.isArray(form.faqs) ? form.faqs : [],
  featureImage1: form.featureImage1 || '',
  featureImage2: form.featureImage2 || '',
  seoTitle: form.seoTitle || '',
  seoDescription: form.seoDescription || '',
  sources: Array.isArray(form.sources) ? form.sources : [],
  download_files: [], // Clear legacy field as it's now migrated to sources
})

export const fetchAdminServices = async () => {
  const [servicesSnap, sectionsSnap] = await Promise.all([
    getDocs(collection(db, 'services')),
    getDocs(collection(db, 'serviceSections')),
  ])
  const sections = docsToArray(sectionsSnap)
  const sectionLookup = buildSectionLookup(sections)
  const services = docsToArray(servicesSnap).map((raw) =>
    adaptServiceForAdmin(raw, sectionLookup)
  )
  return { services, sections, sectionLookup }
}

export const fetchAdminService = async (id) => {
  const [sectionsSnap] = await Promise.all([
    getDocs(collection(db, 'serviceSections')),
  ])
  const sections = docsToArray(sectionsSnap)
  const sectionLookup = buildSectionLookup(sections)

  // 1. Try services (dynamic/new)
  let snap = await getDoc(doc(db, 'services', id))
  
  // 2. Fallback to schemeDetails (legacy/static)
  if (!snap.exists()) {
    snap = await getDoc(doc(db, 'schemeDetails', id))
  }

  if (!snap.exists()) return { service: null, sections, sectionLookup }

  return {
    service: adaptServiceForAdmin({ id: snap.id, ...snap.data() }, sectionLookup),
    sections,
    sectionLookup,
  }
}

export const createAdminService = async (form, sectionLookup) => {
  const payload = adminServicePayload(form, sectionLookup)
  const id = (form.slug || '').trim() || undefined
  if (id) {
    await setDoc(doc(db, 'services', id), stamped(payload))
    return { id }
  }
  const ref = await addDoc(collection(db, 'services'), stamped(payload))
  return { id: ref.id }
}

export const updateAdminService = (id, form, sectionLookup) =>
  updateDoc(doc(db, 'services', id), stamped(adminServicePayload(form, sectionLookup)))

export const deleteAdminService = (id) => deleteDoc(doc(db, 'services', id))

/* -------------------- Government schemes (admin CRUD) -------------------- */

const buildCategoryLookup = (categories) => {
  const idToName = {}
  const nameToId = {}
  for (const category of categories) {
    idToName[category.id] = category.name
    nameToId[category.name] = category.id
  }
  return { idToName, nameToId }
}

export const adaptSchemeForAdmin = (raw, categoryLookup) => {
  if (!raw) return null
  const primaryCatName = raw.categoryId
    ? categoryLookup?.idToName?.[raw.categoryId] || ''
    : ''
  return {
    id: raw.id,
    name: raw.name || '',
    fullTitle: raw.fullTitle || '',
    slug: raw.id,
    avatar: initialsOf(raw.name),
    categoryId: raw.categoryId || '',
    categories: primaryCatName ? [primaryCatName] : [],
    status: raw.status || 'Published',
    order: raw.sortOrder ?? raw.order ?? 0,
    lastUpdated: formatTimestamp(raw.updatedAt),
    highlights: raw.highlights || [],
    tags: raw.tags || [],
    sections: raw.sections || [],
    documents: raw.documents || [],
    objective: raw.objective || '',
    benefits: raw.benefits || '',
    beneficiary: raw.beneficiary || '',
    eligibilityCriteria: raw.eligibilityCriteria || '',
    description: raw.description || '',
    content: raw.content || '',
    seoTitle: raw.seoTitle || '',
    seoDescription: raw.seoDescription || '',
  }
}

const adminSchemePayload = (form, categoryLookup) => {
  const firstCategoryName = (form.categories && form.categories[0]) || ''
  const categoryId =
    form.categoryId || categoryLookup?.nameToId?.[firstCategoryName] || firstCategoryName
  return {
    name: form.name,
    fullTitle: form.fullTitle || '',
    categoryId,
    objective: form.objective || '',
    benefits: form.benefits || '',
    beneficiary: form.beneficiary || '',
    eligibilityCriteria: form.eligibilityCriteria || '',
    description: form.description || '',
    content: form.content || '',
    sortOrder: Number.parseInt(form.order, 10) || 0,
    status: form.status || 'Published',
    highlights: Array.isArray(form.highlights) ? form.highlights.filter(Boolean) : [],
    tags: Array.isArray(form.tags) ? form.tags.filter(Boolean) : [],
    documents: Array.isArray(form.documents) ? form.documents.filter(Boolean) : [],
    seoTitle: form.seoTitle || '',
    seoDescription: form.seoDescription || '',
    slug: form.slug || '',
  }
}

export const fetchAdminSchemes = async () => {
  const [schemesSnap, categoriesSnap] = await Promise.all([
    getDocs(collection(db, 'governmentSchemes')),
    getDocs(collection(db, 'governmentSchemeCategories')),
  ])
  const categories = docsToArray(categoriesSnap)
  const categoryLookup = buildCategoryLookup(categories)
  const schemes = docsToArray(schemesSnap).map((raw) =>
    adaptSchemeForAdmin(raw, categoryLookup)
  )
  return { schemes, categories, categoryLookup }
}

export const fetchAdminScheme = async (id) => {
  const [snap, categoriesSnap] = await Promise.all([
    getDoc(doc(db, 'governmentSchemes', id)),
    getDocs(collection(db, 'governmentSchemeCategories')),
  ])
  const categories = docsToArray(categoriesSnap)
  const categoryLookup = buildCategoryLookup(categories)
  if (!snap.exists()) return { scheme: null, categories, categoryLookup }
  return {
    scheme: adaptSchemeForAdmin({ id: snap.id, ...snap.data() }, categoryLookup),
    categories,
    categoryLookup,
  }
}

export const createAdminScheme = async (form, categoryLookup) => {
  const payload = adminSchemePayload(form, categoryLookup)
  const id = (form.slug || '').trim() || undefined
  if (id) {
    await setDoc(doc(db, 'governmentSchemes', id), stamped(payload))
    return { id }
  }
  const ref = await addDoc(collection(db, 'governmentSchemes'), stamped(payload))
  return { id: ref.id }
}

export const updateAdminScheme = (id, form, categoryLookup) =>
  updateDoc(doc(db, 'governmentSchemes', id), stamped(adminSchemePayload(form, categoryLookup)))

export const deleteAdminScheme = (id) => deleteDoc(doc(db, 'governmentSchemes', id))

/* -------------------- Categories / Sections -------------------- */

export const createServiceSection = (section) => {
  const id = (section.id || section.title || '').trim()
  if (!id) throw new Error('Service section requires an id or title.')
  return setDoc(doc(db, 'serviceSections', id), stamped(section))
}

export const updateServiceSection = (id, section) =>
  updateDoc(doc(db, 'serviceSections', id), stamped(section))

export const deleteServiceSection = (id) =>
  deleteDoc(doc(db, 'serviceSections', id))

export const createSchemeCategory = (category) => {
  const id = (category.id || category.name || '').trim()
  if (!id) throw new Error('Scheme category requires an id or name.')
  return setDoc(doc(db, 'governmentSchemeCategories', id), stamped(category))
}

export const updateSchemeCategory = (id, category) =>
  updateDoc(doc(db, 'governmentSchemeCategories', id), stamped(category))

export const deleteSchemeCategory = (id) =>
  deleteDoc(doc(db, 'governmentSchemeCategories', id))
