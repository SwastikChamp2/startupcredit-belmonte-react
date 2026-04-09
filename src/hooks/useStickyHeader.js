import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function useStickyHeader() {
  const { pathname } = useLocation()

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 992px)')
    let scrollHandler = null

    // Delay to let the header DOM re-render after route change
    const timer = setTimeout(() => {
      const header = document.querySelector('.header.sticky-active')
      const stickyHeader = document.querySelector('.primary-header')
      if (!header || !stickyHeader) return

      // Reset any previous fixed height and scroll state
      header.style.height = ''
      stickyHeader.classList.remove('fixed')

      // Force reflow to get accurate height
      const headerHeight = header.offsetHeight

      // Set header height to prevent layout shift when primary-header becomes fixed
      if (mq.matches) {
        header.style.height = headerHeight + 'px'
      }

      scrollHandler = () => {
        if (!mq.matches) return
        if (window.scrollY >= 110) {
          stickyHeader.classList.add('fixed')
        } else {
          stickyHeader.classList.remove('fixed')
        }
      }

      window.addEventListener('scroll', scrollHandler, { passive: true })
    }, 100)

    return () => {
      clearTimeout(timer)
      if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler)
      }
      // Reset header height on cleanup so next route starts fresh
      const header = document.querySelector('.header.sticky-active')
      const stickyHeader = document.querySelector('.primary-header')
      if (header) header.style.height = ''
      if (stickyHeader) stickyHeader.classList.remove('fixed')
    }
  }, [pathname])
}
