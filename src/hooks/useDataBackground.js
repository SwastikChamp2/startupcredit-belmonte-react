import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function useDataBackground() {
  const { pathname } = useLocation()

  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll('[data-background]').forEach((el) => {
        el.style.backgroundImage = `url(${el.getAttribute('data-background')})`
      })
    }, 0)
    return () => clearTimeout(timer)
  }, [pathname])
}
