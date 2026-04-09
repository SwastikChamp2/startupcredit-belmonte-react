import { useState, useRef } from 'react'

function FileUploadBox({ name, label, file, onFileChange }) {
  const inputRef = useRef(null)
  const [hover, setHover] = useState(false)

  const boxStyle = {
    display: 'block',
    cursor: 'pointer',
    border: hover ? '2px dashed #1E6EE7' : '2px dashed #d0d5dd',
    borderRadius: '10px',
    background: hover ? '#f0f5ff' : '#fafbfc',
    padding: '18px 20px',
    marginBottom: '25px',
    transition: 'all 0.3s ease',
  }

  const iconStyle = {
    width: '46px',
    height: '46px',
    minWidth: '46px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #1E6EE7 0%, #4b8ff7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '18px',
    transition: 'transform 0.3s ease',
    transform: hover ? 'translateY(-2px)' : 'none',
  }

  const btnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 18px',
    borderRadius: '6px',
    background: hover ? '#1E6EE7' : '#fff',
    border: hover ? '1px solid #1E6EE7' : '1px solid #d0d5dd',
    fontSize: '13px',
    fontWeight: '600',
    color: hover ? '#fff' : '#191F29',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease',
  }

  return (
    <div
      style={boxStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => onFileChange(e.target.files[0] || null)}
        style={{ display: 'none' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={iconStyle}>
          <i className="fas fa-cloud-upload-alt" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {file ? (
            <>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E6EE7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file.name}
              </div>
              <div style={{ fontSize: '12px', color: '#74787C', marginTop: '2px' }}>
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#191F29' }}>{label}</div>
              <div style={{ fontSize: '13px', color: '#74787C', marginTop: '2px' }}>PDF, JPG, PNG (Optional)</div>
            </>
          )}
        </div>
        <span style={btnStyle}>Browse</span>
      </div>
    </div>
  )
}

export default FileUploadBox
