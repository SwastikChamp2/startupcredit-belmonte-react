import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function useStickyHeader() {
  const { pathname } = useLocation()

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 992px)')

    // Small delay to let the header re-render after route change
    const timer = setTimeout(() => {
      const header = document.querySelector('.header.sticky-active')
      const stickyHeader = document.querySelector('.primary-header')
      if (!header || !stickyHeader) return

      // Reset height first
      header.style.height = ''

      function handleScroll() {
        if (!mq.matches) return
        if (window.scrollY >= 110) {
          stickyHeader.classList.add('fixed')
        } else {
          stickyHeader.classList.remove('fixed')
        }
      }

      // Set header height to prevent layout shift
      if (mq.matches) {
        header.style.height = header.offsetHeight + 'px'
      }

      // Reset scroll class on route change
      stickyHeader.classList.remove('fixed')

      window.addEventListener('scroll', handleScroll, { passive: true })

      // Store cleanup ref
      timer._cleanup = () => {
        window.removeEventListener('scroll', handleScroll)
        if (header) header.style.height = ''
      }
    }, 50)

    return () => {
      clearTimeout(timer)
      if (timer._cleanup) timer._cleanup()
    }
  }, [pathname])
}
