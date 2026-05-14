// Direct Firestore reads for static reference data. No backend required.
//
// Each helper memoizes the in-flight promise so concurrent components share
// a single read, then memoizes the resolved value for the lifetime of the
// page (a hard refresh re-fetches).

import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

const inflight = new Map()
const resolved = new Map()

const cached = (key, loader) => {
  if (resolved.has(key)) return Promise.resolve(resolved.get(key))
  if (inflight.has(key)) return inflight.get(key)
  const promise = loader()
    .then((value) => {
      resolved.set(key, value)
      return value
    })
    .finally(() => {
      inflight.delete(key)
    })
  inflight.set(key, promise)
  return promise
}

const docsToArray = (snapshot) =>
  snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() }))

export const fetchServicesData = () =>
  cached('services', async () => {
    const [servicesSnap, sectionsSnap] = await Promise.all([
      getDocs(collection(db, 'services')),
      getDocs(collection(db, 'serviceSections')),
    ])
    const services = docsToArray(servicesSnap).sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    )
    const serviceSections = docsToArray(sectionsSnap).sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    )
    const servicesBySection = {}
    for (const service of services) {
      const sid = service.sectionId
      if (!servicesBySection[sid]) servicesBySection[sid] = []
      servicesBySection[sid].push(service)
    }
    return { services, serviceSections, servicesBySection }
  })

export const fetchGovernmentSchemes = () =>
  cached('governmentSchemes', async () => {
    const [schemesSnap, categoriesSnap] = await Promise.all([
      getDocs(collection(db, 'governmentSchemes')),
      getDocs(collection(db, 'governmentSchemeCategories')),
    ])
    const schemes = docsToArray(schemesSnap).sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    )
    const categories = docsToArray(categoriesSnap).sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    )
    const categoryMap = Object.fromEntries(
      categories.map((category) => [
        category.id,
        {
          ...category,
          schemes: schemes.filter((scheme) => scheme.categoryId === category.id),
        },
      ])
    )
    const schemesById = Object.fromEntries(
      schemes.map((scheme) => [scheme.id, scheme])
    )
    return { schemes, categories, categoryMap, schemesById }
  })

export const fetchSchemeDetails = () =>
  cached('schemeDetails', async () => {
    const snap = await getDocs(collection(db, 'schemeDetails'))
    const out = {}
    for (const docSnap of snap.docs) {
      out[docSnap.id] = docSnap.data()
    }
    return out
  })

export const fetchSchemeDetail = (schemeId) =>
  cached(`schemeDetail:${schemeId}`, async () => {
    // 1. Try services FIRST (admin-created/edited services take priority)
    const sRef = doc(db, 'services', schemeId)
    const sSnap = await getDoc(sRef)
    if (sSnap.exists()) {
      const data = sSnap.data()
      // Normalize to the shape ServiceDetails.jsx expects
      return {
        service_name: data.title || data.name,
        page_body: data.content || data.description,
        service_details_image: data.image,
        service_details_image_alt: data.alt || data.title || data.name,
        feature_bullet_points: data.highlights || [],
        feature_image_1: data.featureImage1 || data.image,
        feature_image_2: data.featureImage2 || data.image,
        our_approach_body: data.ourApproach || '',
        faqs: data.faqs || [],
        download_files: [
          ...(data.download_files || []).map(f => ({ ...f, url: f.href || f.url })),
          ...(data.sources || []).map(s => ({ ...s, url: s.url || s.href, isSource: true }))
        ],
        other_services: data.other_services || [],
      }
    }

    // 2. Fallback to schemeDetails (legacy/seeded docs)
    const ref = doc(db, 'schemeDetails', schemeId)
    const snap = await getDoc(ref)
    if (snap.exists()) return snap.data()

    const err = new Error('Scheme not found.')
    err.status = 404
    throw err
  })

export const fetchNicData = () =>
  cached('nicData', async () => {
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
  })
