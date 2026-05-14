import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function toClass(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function AdminStatusDropdown({
  badgeClassName,
  isLocked = false,
  isOpen,
  onClose,
  onLockedClick,
  onOpen,
  onStatusChange,
  status,
  statuses,
}) {
  const triggerRef = useRef(null)
  const [menuStyle, setMenuStyle] = useState({})

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect()

    if (rect) {
      setMenuStyle({
        left: `${rect.left}px`,
        top: `${rect.bottom + 6}px`,
        width: `${Math.max(rect.width, 230)}px`,
      })
    }

    onOpen()
  }

  const handleTriggerClick = () => {
    if (isLocked) {
      onLockedClick?.()
      return
    }
    if (isOpen) {
      onClose()
    } else {
      openMenu()
    }
  }

  return (
    <div className="admin-project-status-dropdown">
      <button
        aria-expanded={isOpen}
        className={`admin-project-status-trigger ${badgeClassName} ${toClass(status)}`}
        ref={triggerRef}
        onClick={handleTriggerClick}
        title={isLocked ? 'This status is locked and cannot be changed' : 'Update status'}
        type="button"
      >
        <span>{status}</span>
        {!isLocked && (
          <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} aria-hidden="true"></i>
        )}
      </button>

      {isOpen && !isLocked && createPortal(
        <div className="admin-project-status-menu" role="listbox" style={menuStyle}>
          {statuses.map((option) => (
            <button
              className={`${toClass(option)}${option === status ? ' active' : ''}`}
              key={option}
              aria-selected={option === status}
              onClick={() => {
                onStatusChange(option)
                onClose()
              }}
              role="option"
              type="button"
            >
              {option}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}

export default AdminStatusDropdown
