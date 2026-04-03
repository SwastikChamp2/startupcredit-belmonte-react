import { useEffect } from 'react'

export default function useScrollToTop() {
  useEffect(() => {
    const el = document.getElementById('scroll-percentage')
    const valueEl = document.getElementById('scroll-percentage-value')
    if (!el || !valueEl) return

    function onScroll() {
      const scrollTop = document.documentElement.scrollTop
      const calcHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrollValue = Math.round((scrollTop / calcHeight) * 100) || 0

      el.style.background = `conic-gradient(var(--bz-color-theme-primary) ${scrollValue}%, var(--bz-color-common-white) ${scrollValue}%)`

      if (scrollTop > 100) {
        el.classList.add('active')
      } else {
        el.classList.remove('active')
      }

      if (scrollValue < 96) {
        valueEl.textContent = `${scrollValue}%`
      } else {
        valueEl.innerHTML = '<i class="fas fa-arrow-up-long"></i>'
      }
    }

    function scrollToTop() {
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('click', scrollToTop)
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      el.removeEventListener('click', scrollToTop)
    }
  }, [])
}
