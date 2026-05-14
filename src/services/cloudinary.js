// Direct (browser → Cloudinary) unsigned upload. No backend required.
//
// Configure in Cloudinary Console → Settings → Upload → Add upload preset:
//   Signing Mode: Unsigned
//   Allowed formats: pdf,doc,docx,xls,xlsx,jpg,jpeg,png
//   Max file size: 10485760 (10 MB)
//   Use filename / Unique filename: On
//
// Then add to .env.local:
//   VITE_CLOUDINARY_CLOUD_NAME=<your cloud name>
//   VITE_CLOUDINARY_UPLOAD_PRESET=<the preset name above>

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const PDF_EXT = 'pdf'
const OFFICE_EXTS = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'])
const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'])

const getExtension = (file) => {
  const fromName = String(file?.name || '').split('.').pop()?.toLowerCase()
  return fromName || ''
}

// PDFs go to resource_type "image" so Cloudinary serves them with the
// application/pdf content type → renders inline in <iframe>. Office docs go
// to "raw" so the bytes are served untouched (Google Docs Viewer renders).
const pickResourceType = (file) => {
  const ext = getExtension(file)
  if (ext === PDF_EXT) return 'image'
  if (OFFICE_EXTS.has(ext)) return 'raw'
  if (IMAGE_EXTS.has(ext)) return 'image'
  if ((file?.type || '').startsWith('image/')) return 'image'
  return 'raw'
}

const labelFromExtension = (ext) => {
  if (ext === 'pdf') return 'PDF'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'Excel'
  if (['doc', 'docx'].includes(ext)) return 'Word'
  if (['ppt', 'pptx'].includes(ext)) return 'PowerPoint'
  if (['jpg', 'jpeg'].includes(ext)) return 'JPG'
  if (ext === 'png') return 'PNG'
  return ext ? ext.toUpperCase() : 'File'
}

const formatBytes = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const uploadToCloudinary = async (file, folder) => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local.'
    )
  }
  if (!file) throw new Error('No file provided.')

  const resourceType = pickResourceType(file)
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)
  if (folder) fd.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: 'POST', body: fd }
  )

  if (!response.ok) {
    let message = `Upload failed (${response.status})`
    try {
      const err = await response.json()
      message = err?.error?.message || message
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  const data = await response.json()
  const ext = (data.format || getExtension(file) || '').toLowerCase()
  const displayName = data.original_filename
    ? `${data.original_filename}${ext ? `.${ext}` : ''}`
    : file.name

  // Every field defaulted to a non-undefined value. Firestore rejects
  // documents that contain `undefined` anywhere (including nested), so be
  // defensive — Cloudinary's response can omit `format` for raw uploads,
  // `bytes` rarely, etc.
  return {
    name: displayName || file.name || '',
    type: labelFromExtension(ext),
    size: formatBytes(data.bytes ?? file.size ?? 0),
    url: data.secure_url || '',
    publicId: data.public_id || '',
    resourceType: data.resource_type || '',
    format: data.format || ext || '',
    bytes: data.bytes ?? file.size ?? 0,
    mimeType: file.type || '',
    originalFilename: file.name || '',
    fileSize: file.size ?? 0,
    uploadedOn: new Date().toISOString(),
  }
}
