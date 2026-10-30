import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import CountryCodeSelect from './CountryCodeSelect'
import '../styles/auth-modal.css'

function ProfileEditModal({ open, onClose }) {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', countryCode: '91', phoneNumber: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        countryCode: user.countryCode || '91',
        phoneNumber: user.phoneNumber || '',
      })
    }
    setError('')
    setBusy(false)
  }, [open, user])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handlePhoneInput = (e) => {
    const value = e.target.value
    e.target.value = value.replace(/[^0-9]/g, '').slice(0, 10)
    const { name } = e.target
    setForm((current) => ({ ...current, [name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!/^[0-9]{10}$/.test(form.phoneNumber)) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }

    setBusy(true)
    try {
      await updateProfile({
        name: form.name.trim(),
        countryCode: form.countryCode,
        phoneNumber: form.phoneNumber,
      })
      onClose?.()
    } catch (err) {
      setError(err?.message || 'Could not save your details.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="auth-modal"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="auth-modal__dialog" onClick={(event) => event.stopPropagation()}>
        <button
          aria-label="Close"
          className="auth-modal__close"
          onClick={onClose}
          type="button"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>

        <div className="auth-modal__header">
          <h3>Edit Profile</h3>
          <p>Update your personal information.</p>
        </div>

        <form className="auth-modal__form" onSubmit={handleSubmit}>
          <label className="auth-modal__field">
            <span>Name</span>
            <input
              autoComplete="name"
              name="name"
              onChange={updateField}
              placeholder="Enter your full name"
              required
              type="text"
              value={form.name}
            />
          </label>

          <label className="auth-modal__field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              disabled
              type="email"
              value={form.email}
              className="auth-modal__field__disabled"
            />
          </label>

          <label className="auth-modal__field">
            <span>Phone Number</span>
            <div className="phone-input-group">
              <CountryCodeSelect
                value={form.countryCode}
                onChange={(value) => setForm((c) => ({ ...c, countryCode: value }))}
              />
              <input
                autoComplete="tel"
                name="phoneNumber"
                onInput={handlePhoneInput}
                placeholder="10-digit number"
                required
                type="tel"
                value={form.phoneNumber}
                maxLength={10}
                minLength={10}
                pattern="[0-9]{10}"
              />
            </div>
          </label>

          {error && <p className="auth-modal__error">{error}</p>}

          <button className="auth-modal__submit" type="submit" disabled={busy}>
            {busy ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfileEditModal
