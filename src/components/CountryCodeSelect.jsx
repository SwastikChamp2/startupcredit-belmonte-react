import { useState, useRef, useEffect } from 'react'
import { countryCodes } from '../../utils/countryCodes'

function CountryCodeSelect({ value, onChange, disabled = false, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  const selectedCountry = Object.entries(countryCodes).find(([_, code]) => code === value)

  const filteredCountries = Object.entries(countryCodes).filter(([country, code]) => {
    const search = searchTerm.toLowerCase()
    return country.toLowerCase().includes(search) || code.includes(search)
  })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (code) => {
    onChange(code)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={`country-code-select ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`country-code-select__trigger ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="country-code-select__value">
          {selectedCountry ? `+${value}` : 'Select'}
        </span>
        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} />
      </button>

      {isOpen && (
        <div className="country-code-select__dropdown">
          <div className="country-code-select__search">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="country-code-select__options">
            {filteredCountries.length === 0 ? (
              <div className="country-code-select__no-results">No countries found</div>
            ) : (
              filteredCountries.map(([country, code]) => (
                <button
                  key={country}
                  type="button"
                  className={`country-code-select__option ${code === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(code)}
                >
                  <span className="country-code-select__country-name">{country}</span>
                  <span className="country-code-select__country-code">+{code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CountryCodeSelect
