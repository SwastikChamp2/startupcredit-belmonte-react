import { useEffect } from 'react'

export default function useStickyHeader() {
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 992px)')
    const header = document.querySelector('.header.sticky-active')
    const stickyHeader = document.querySelector('.primary-header')
    if (!header || !stickyHeader) return

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

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
}
