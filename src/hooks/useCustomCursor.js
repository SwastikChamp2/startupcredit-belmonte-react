import { useEffect } from 'react'

export default function useCustomCursor() {
  useEffect(() => {
    const cursor = document.createElement('div')
    cursor.className = 'mt-cursor'
    document.body.appendChild(cursor)

    function onMouseMove(e) {
      cursor.style.transform = `translate(${e.clientX - 15}px, ${e.clientY - 15}px)`
      cursor.style.visibility = 'inherit'
    }

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cursor.remove()
    }
  }, [])
}
