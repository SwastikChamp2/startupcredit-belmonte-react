import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore'
// Admin pages listen through the dedicated admin Firestore instance so the
// listeners use the admin's auth context (and `admin: true` claim) — fully
// isolated from any public-site sign-in/sign-out.
import { adminDb as db } from '../firebase'

/**
 * Subscribe to a Firestore collection in real time. Whenever a doc is
 * created/updated/deleted server-side, the returned `items` array refreshes.
 *
 * Pass an `adapter(rawDoc) => shaped` to convert each doc into the same shape
 * the page used to expect from the REST `fetchAdmin*` helpers.
 *
 * @param {string|null} collectionName  Pass null to skip subscribing.
 * @param {Function|null} adapter
 * @param {{ orderByField?: string, orderDirection?: 'asc'|'desc' }} options
 */
export function useFirestoreCollection(collectionName, adapter = null, options = {}) {
  const { orderByField, orderDirection = 'desc' } = options
  const [items, setItems] = useState([])
  // Initialize loading from props directly so we never need to call setState
  // synchronously inside the effect.
  const [loading, setLoading] = useState(Boolean(collectionName))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!collectionName) return undefined

    let q = collection(db, collectionName)
    if (orderByField) q = query(q, orderBy(orderByField, orderDirection))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((snap) => {
          const raw = { id: snap.id, ...snap.data() }
          return adapter ? adapter(raw) : raw
        })
        setItems(docs)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error(`onSnapshot(${collectionName}) error:`, err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [collectionName, adapter, orderByField, orderDirection])

  return { items, loading, error }
}

/**
 * Subscribe to a single Firestore document in real time.
 */
export function useFirestoreDoc(collectionName, docId, adapter = null) {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(Boolean(collectionName && docId))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!collectionName || !docId) return undefined

    const ref = doc(db, collectionName, docId)
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setItem(null)
        } else {
          const raw = { id: snap.id, ...snap.data() }
          setItem(adapter ? adapter(raw) : raw)
        }
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error(`onSnapshot(${collectionName}/${docId}) error:`, err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [collectionName, docId, adapter])

  return { item, loading, error }
}
