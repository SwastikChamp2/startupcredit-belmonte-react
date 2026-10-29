/**
 * Formats phone number for display
 * @param {string} countryCode - The country code (e.g., '91')
 * @param {string} phoneNumber - The phone number (e.g., '9876543210')
 * @returns {string} Formatted phone number (e.g., '+91 9876543210')
 */
export const formatPhoneNumber = (countryCode, phoneNumber) => {
  if (!countryCode || !phoneNumber) return ''
  return `+${countryCode} ${phoneNumber}`
}
