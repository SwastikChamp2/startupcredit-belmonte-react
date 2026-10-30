// src/pages/Test.jsx
import { useState } from 'react'
import { collection, getDocs, writeBatch } from 'firebase/firestore'
import { db } from '../firebase' // swap to `adminDb` if this page runs under the admin auth session

const FIELD_TYPES = ['string', 'number', 'boolean', 'array', 'object']
const BATCH_LIMIT = 500

const initialForm = {
  collectionName: '',
  fieldName: '',
  fieldType: 'string',
  fieldValue: '',
}

// Parses & validates the raw input according to the selected type.
// Throws an Error with a user-friendly message if invalid.
const parseValue = (type, raw) => {
  switch (type) {
    case 'string':
      return raw
    case 'number': {
      if (raw.trim() === '' || Number.isNaN(Number(raw))) {
        throw new Error('Please enter a valid number.')
      }
      return Number(raw)
    }
    case 'boolean':
      if (raw !== 'true' && raw !== 'false') {
        throw new Error('Please select true or false.')
      }
      return raw === 'true'
    case 'array': {
      let parsed
      try {
        parsed = JSON.parse(raw)
      } catch {
        throw new Error('Invalid array. Enter valid JSON, e.g. ["a", 1, true].')
      }
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid array. The value must be a JSON array, e.g. [1, 2, 3].')
      }
      return parsed
    }
    case 'object': {
      let parsed
      try {
        parsed = JSON.parse(raw)
      } catch {
        throw new Error('Invalid object. Enter valid JSON, e.g. {"key": "value"}.')
      }
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Invalid object. The value must be a JSON object, e.g. {"key": "value"}.')
      }
      return parsed
    }
    default:
      throw new Error('Unsupported field type.')
  }
}

export default function Test() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setError('')
    setForm((prev) => {
      // Reset value when the type changes so stale input doesn't carry over
      if (name === 'fieldType') {
        return { ...prev, fieldType: value, fieldValue: value === 'boolean' ? 'true' : '' }
      }
      return { ...prev, [name]: value }
    })
  }

  const closeModal = () => {
    if (loading) return
    setOpen(false)
    setForm(initialForm)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const collectionName = form.collectionName.trim()
    const fieldName = form.fieldName.trim()

    if (!collectionName) return setError('Collection name is required.')
    if (!fieldName) return setError('Field name is required.')

    let value
    try {
      value = parseValue(form.fieldType, form.fieldValue)
    } catch (err) {
      return setError(err.message)
    }

    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, collectionName))

      if (snapshot.empty) {
        setError(`No documents found in "${collectionName}".`)
        return
      }

      // Firestore batches are limited to 500 writes, so chunk the docs.
      // set + merge treats the field name literally (no dot-path nesting)
      // and adds the field if missing or overwrites it if present.
      const docs = snapshot.docs
      for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db)
        docs.slice(i, i + BATCH_LIMIT).forEach((d) => {
          batch.set(d.ref, { [fieldName]: value }, { merge: true })
        })
        await batch.commit()
      }

      setSuccess(`Field "${fieldName}" set on ${docs.length} document(s) in "${collectionName}".`)
      setOpen(false)
      setForm(initialForm)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong while updating documents.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

  return (
  <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-4">
    <button
      onClick={() => {
        setSuccess('')
        setOpen(true)
      }}
      className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-300"
    >
      Mass Update / Add a field
    </button>

    {success && (
      <p className="mt-6 max-w-md rounded-lg bg-green-50 px-4 py-3 text-center text-sm text-green-700">
        {success}
      </p>
    )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-gray-900">Mass Update / Add a field</h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Collection name</label>
              <input
                name="collectionName"
                value={form.collectionName}
                onChange={handleChange}
                placeholder="e.g. users"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Field name</label>
              <input
                name="fieldName"
                value={form.fieldName}
                onChange={handleChange}
                placeholder="e.g. isVerified"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Field type</label>
              <select
                name="fieldType"
                value={form.fieldType}
                onChange={handleChange}
                className={inputClass}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Field value</label>

              {form.fieldType === 'boolean' ? (
                <select
                  name="fieldValue"
                  value={form.fieldValue || 'true'}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : form.fieldType === 'array' || form.fieldType === 'object' ? (
                <textarea
                  name="fieldValue"
                  value={form.fieldValue}
                  onChange={handleChange}
                  rows={5}
                  placeholder={
                    form.fieldType === 'array' ? '["item1", "item2", 3]' : '{"key": "value"}'
                  }
                  className={`${inputClass} font-mono`}
                />
              ) : (
                <input
                  name="fieldValue"
                  type={form.fieldType === 'number' ? 'number' : 'text'}
                  value={form.fieldValue}
                  onChange={handleChange}
                  placeholder="Enter value"
                  className={inputClass}
                />
              )}
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}