// src/pages/Test.jsx
import { useEffect, useState } from 'react'
import { collection, getDocs, writeBatch } from 'firebase/firestore'
import { db } from '../firebase' // swap to `adminDb` if this page runs under the admin auth session

const FIELD_TYPES = ['string', 'number', 'boolean', 'array', 'object']
const BATCH_LIMIT = 500

const initialForm = {
  collectionName: '',
  fieldName: '',
  fieldType: 'string',
  fieldValue: '',
  skipExisting: false,
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

const styles = `
.mu-page {
  --mu-ink: #181a2b;
  --mu-muted: #5f6378;
  --mu-line: #d9dbe7;
  --mu-bg: #f3f4f9;
  --mu-surface: #ffffff;
  --mu-accent: #4338ca;
  --mu-accent-hover: #3730a3;
  --mu-danger: #b42318;
  --mu-danger-bg: #fef3f2;
  --mu-ok: #027a48;
  --mu-ok-bg: #ecfdf3;

  box-sizing: border-box;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--mu-bg);
  color: var(--mu-ink);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
.mu-page *, .mu-page *::before, .mu-page *::after { box-sizing: border-box; }

.mu-panel {
  width: 100%;
  max-width: 440px;
  padding: 32px;
  background: var(--mu-surface);
  border: 1px solid var(--mu-line);
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(24, 26, 43, 0.04), 0 12px 32px -12px rgba(24, 26, 43, 0.12);
}
.mu-title { margin: 0 0 6px; font-size: 22px; font-weight: 650; letter-spacing: -0.01em; }
.mu-lead { margin: 0 0 24px; font-size: 14px; line-height: 1.55; color: var(--mu-muted); }

.mu-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 18px;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  border-radius: 9px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s, opacity 0.15s;
}
.mu-btn:focus-visible { outline: 3px solid rgba(67, 56, 202, 0.35); outline-offset: 2px; }
.mu-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.mu-btn-primary { background: var(--mu-accent); color: #fff; }
.mu-btn-primary:hover:not(:disabled) { background: var(--mu-accent-hover); }
.mu-btn-ghost { background: #fff; color: var(--mu-ink); border-color: var(--mu-line); }
.mu-btn-ghost:hover:not(:disabled) { background: var(--mu-bg); }
.mu-btn-block { width: 100%; min-height: 46px; font-size: 15px; }

.mu-alert { margin-top: 16px; padding: 11px 14px; font-size: 13.5px; line-height: 1.5; border-radius: 9px; }
.mu-alert-ok { background: var(--mu-ok-bg); color: var(--mu-ok); }
.mu-alert-err { background: var(--mu-danger-bg); color: var(--mu-danger); }

.mu-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(24, 26, 43, 0.5);
  backdrop-filter: blur(2px);
  animation: mu-fade 0.15s ease-out;
}
.mu-modal {
  width: 100%;
  max-width: 460px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 28px;
  background: var(--mu-surface);
  border-radius: 14px;
  box-shadow: 0 24px 60px -16px rgba(24, 26, 43, 0.4);
  animation: mu-rise 0.18s ease-out;
}
.mu-modal-title { margin: 0 0 4px; font-size: 19px; font-weight: 650; letter-spacing: -0.01em; }
.mu-modal-sub { margin: 0 0 20px; font-size: 13.5px; line-height: 1.5; color: var(--mu-muted); }

.mu-field { margin-bottom: 16px; }
.mu-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.mu-label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--mu-ink); }
.mu-input {
  display: block;
  width: 100%;
  min-height: 40px;
  padding: 9px 12px;
  font: inherit;
  font-size: 14px;
  color: var(--mu-ink);
  background: #fff;
  border: 1px solid var(--mu-line);
  border-radius: 9px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.mu-input::placeholder { color: #9a9db2; }
.mu-input:hover { border-color: #b9bcd0; }
.mu-input:focus { outline: none; border-color: var(--mu-accent); box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.18); }
.mu-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.5; resize: vertical; }

.mu-check {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--mu-ink);
  cursor: pointer;
}
.mu-check input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--mu-accent);
  cursor: pointer;
}
.mu-check input:focus-visible { outline: 3px solid rgba(67, 56, 202, 0.35); outline-offset: 2px; }

.mu-note {
  margin: 4px 0 16px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--mu-muted);
  background: var(--mu-bg);
  border-radius: 9px;
}
.mu-note strong { color: var(--mu-ink); font-weight: 600; }

.mu-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

@media (max-width: 480px) {
  .mu-panel { padding: 24px 20px; }
  .mu-modal { padding: 22px 18px; }
  .mu-row { grid-template-columns: 1fr; gap: 0; }
}
@keyframes mu-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes mu-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .mu-overlay, .mu-modal { animation: none; }
  .mu-btn, .mu-input { transition: none; }
}
`

export default function Test() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setError('')
    setForm((prev) => {
      if (type === 'checkbox') return { ...prev, [name]: checked }
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

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading])

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
      // If "do not overwrite" is checked, docs that already have the field are skipped.
      const allDocs = snapshot.docs
      const docs = form.skipExisting
        ? allDocs.filter((d) => !Object.prototype.hasOwnProperty.call(d.data(), fieldName))
        : allDocs
      const skipped = allDocs.length - docs.length

      for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db)
        docs.slice(i, i + BATCH_LIMIT).forEach((d) => {
          batch.set(d.ref, { [fieldName]: value }, { merge: true })
        })
        await batch.commit()
      }

      setSuccess(
        `Field "${fieldName}" set on ${docs.length} document(s) in "${collectionName}".` +
          (form.skipExisting ? ` Skipped ${skipped} that already had it.` : '')
      )
      setOpen(false)
      setForm(initialForm)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong while updating documents.')
    } finally {
      setLoading(false)
    }
  }

  const showNote = form.collectionName.trim() && form.fieldName.trim()

  return (
    <div className="mu-page">
      <style>{styles}</style>

      <main className="mu-panel">
        <h1 className="mu-title">Mass update</h1>
        <p className="mu-lead">
          Add a field to every document in a Firestore collection, or overwrite it where it already exists.
        </p>

        <button
          type="button"
          className="mu-btn mu-btn-primary mu-btn-block"
          onClick={() => {
            setSuccess('')
            setOpen(true)
          }}
        >
          Add a field to a collection
        </button>

        {success && (
          <p className="mu-alert mu-alert-ok" role="status">
            {success}
          </p>
        )}
      </main>

      {open && (
        <div className="mu-overlay" onClick={closeModal}>
          <form
            className="mu-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mu-modal-title"
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mu-modal-title" id="mu-modal-title">
              Add a field to a collection
            </h2>
            <p className="mu-modal-sub">The field is written to every document in the collection.</p>

            <div className="mu-row">
              <div className="mu-field">
                <label className="mu-label" htmlFor="mu-collection">
                  Collection name
                </label>
                <input
                  id="mu-collection"
                  className="mu-input"
                  name="collectionName"
                  value={form.collectionName}
                  onChange={handleChange}
                  placeholder="e.g. users"
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <div className="mu-field">
                <label className="mu-label" htmlFor="mu-field-name">
                  Field name
                </label>
                <input
                  id="mu-field-name"
                  className="mu-input"
                  name="fieldName"
                  value={form.fieldName}
                  onChange={handleChange}
                  placeholder="e.g. isVerified"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="mu-field">
              <label className="mu-label" htmlFor="mu-field-type">
                Field type
              </label>
              <select
                id="mu-field-type"
                className="mu-input"
                name="fieldType"
                value={form.fieldType}
                onChange={handleChange}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="mu-field">
              <label className="mu-label" htmlFor="mu-field-value">
                Field value
              </label>

              {form.fieldType === 'boolean' ? (
                <select
                  id="mu-field-value"
                  className="mu-input"
                  name="fieldValue"
                  value={form.fieldValue || 'true'}
                  onChange={handleChange}
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : form.fieldType === 'array' || form.fieldType === 'object' ? (
                <textarea
                  id="mu-field-value"
                  className="mu-input mu-mono"
                  name="fieldValue"
                  value={form.fieldValue}
                  onChange={handleChange}
                  rows={5}
                  spellCheck={false}
                  placeholder={
                    form.fieldType === 'array' ? '["item1", "item2", 3]' : '{"key": "value"}'
                  }
                />
              ) : (
                <input
                  id="mu-field-value"
                  className="mu-input"
                  name="fieldValue"
                  type={form.fieldType === 'number' ? 'number' : 'text'}
                  value={form.fieldValue}
                  onChange={handleChange}
                  placeholder="Enter value"
                  autoComplete="off"
                />
              )}
            </div>

            <label className="mu-check" htmlFor="mu-skip-existing">
              <input
                id="mu-skip-existing"
                type="checkbox"
                name="skipExisting"
                checked={form.skipExisting}
                onChange={handleChange}
              />
              Do not overwrite existing fields
            </label>

            {showNote && (
              <p className="mu-note">
                This sets <strong>{form.fieldName.trim()}</strong> on every document in{' '}
                <strong>{form.collectionName.trim()}</strong>.{' '}
                {form.skipExisting
                  ? 'Documents that already have this field are skipped.'
                  : 'Existing values are overwritten.'}
              </p>
            )}

            {error && (
              <p className="mu-alert mu-alert-err" role="alert">
                {error}
              </p>
            )}

            <div className="mu-actions">
              <button type="button" className="mu-btn mu-btn-ghost" onClick={closeModal} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="mu-btn mu-btn-primary" disabled={loading}>
                {loading ? 'Updating…' : 'Update documents'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}