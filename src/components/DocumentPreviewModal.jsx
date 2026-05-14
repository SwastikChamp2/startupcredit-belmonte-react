import { useEffect, useMemo } from 'react'
import { documentDownloadUrl } from '../services/adminDataApi'

const OFFICE_EXTS = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'])
const OFFICE_MIME_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
])

const getExt = (file) =>
  String(file?.name || file?.originalFilename || file?.url || '')
    .split('?')[0]
    .split('.')
    .pop()
    ?.toLowerCase() || ''

const isPdfFile = (file, ext) =>
  ext === 'pdf' || file?.mimeType === 'application/pdf'

const isOfficeFile = (file, ext) =>
  OFFICE_EXTS.has(ext) || OFFICE_MIME_TYPES.has(file?.mimeType || '')

// Production document preview.
//   PDF  → <iframe src={cloudinaryUrl}> (Cloudinary serves with Content-Type:
//          application/pdf because it was uploaded as resource_type: 'image').
//   Office (DOC/DOCX/XLS/XLSX/PPT/PPTX)
//        → Google Docs Viewer iframe.
//   Image / CSV / other → <iframe src={cloudinaryUrl}> directly.
function DocumentPreviewModal({ open, file, title, onClose }) {
  const ext = useMemo(() => getExt(file), [file])
  const isPdf = isPdfFile(file, ext)
  const isOffice = isOfficeFile(file, ext)

  const iframeSrc = useMemo(() => {
    if (!file?.url) return null
    if (isOffice) {
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(file.url)}`
    }
    return file.url
  }, [file, isOffice])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open || !file) return null

  const downloadUrl = documentDownloadUrl(file)
  const displayTitle = title || file.name || 'Document preview'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${displayTitle} preview`}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(8, 17, 41, 0.78)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(1100px, 100%)',
          height: 'min(820px, calc(100vh - 48px))',
          background: '#ffffff',
          borderRadius: 14,
          boxShadow: '0 30px 70px rgba(8, 17, 41, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '14px 18px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <strong
              style={{
                display: 'block',
                color: '#0f172a',
                fontSize: 15,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={displayTitle}
            >
              {displayTitle}
            </strong>
            {file.type && (
              <span style={{ display: 'block', fontSize: 12, color: '#64748b' }}>
                {file.type}
                {file.size ? ` · ${file.size}` : ''}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {file.url && (
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  color: '#1e3a8a',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                Open File
              </a>
            )}
            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: '#1c65d1',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <i className="fa-solid fa-download" aria-hidden="true" />
                Download
              </a>
            )}
            <button
              type="button"
              aria-label="Close preview"
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                border: 0,
                borderRadius: '50%',
                background: 'rgba(15, 35, 68, 0.08)',
                color: '#0f172a',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div style={{ flex: 1, minHeight: 0, background: '#1f2937', position: 'relative' }}>
          {iframeSrc ? (
            <>
              <iframe
                key={iframeSrc}
                src={iframeSrc}
                title={displayTitle}
                width="100%"
                height="100%"
                style={{ border: 0, background: '#ffffff' }}
              />
              {isOffice && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    right: 8,
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'rgba(255, 251, 235, 0.95)',
                    color: '#92400e',
                    fontSize: 12,
                    lineHeight: 1.4,
                    pointerEvents: 'none',
                  }}
                >
                  Office docs preview through Google&apos;s viewer. Newly uploaded
                  files may take ~30 seconds to appear; use Open File / Download
                  if it stays blank.
                </div>
              )}
              {isPdf && file?.url?.includes('/raw/upload/') && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    right: 8,
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'rgba(254, 226, 226, 0.95)',
                    color: '#991b1b',
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  This PDF was uploaded with the older configuration and may not
                  render. Re-upload it to use the new image-based delivery.
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                color: '#fff',
                padding: 24,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              No preview URL available for this document.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentPreviewModal
