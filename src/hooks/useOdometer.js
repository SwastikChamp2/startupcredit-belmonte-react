import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function useOdometer() {
  const { pathname } = useLocation()

  useEffect(() => {
    const timer = setTimeout(() => {
      const odometerEls = document.querySelectorAll('.odometer')
      if (!odometerEls.length) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target
              const countValue = el.getAttribute('data-count')
              el.innerHTML = countValue
              observer.unobserve(el)
            }
          })
        },
        { rootMargin: '-20% 0px' }
      )

      odometerEls.forEach((el) => observer.observe(el))

      return () => observer.disconnect()
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname])
}
