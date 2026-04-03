import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function useFadeWrapper() {
  const { pathname } = useLocation()

  useEffect(() => {
    const gsap = window.gsap
    const ScrollTrigger = window.ScrollTrigger
    if (!gsap || !ScrollTrigger) return
    gsap.registerPlugin(ScrollTrigger)

    const timer = setTimeout(() => {
      const fadeWrappers = document.querySelectorAll('.fade-wrapper')
      fadeWrappers.forEach((section) => {
        const fadeItems = section.querySelectorAll('.fade-top')
        fadeItems.forEach((element, index) => {
          const delay = index * 0.15

          gsap.set(element, { opacity: 0, y: 100 })

          ScrollTrigger.create({
            trigger: element,
            start: 'top 100%',
            end: 'bottom 20%',
            scrub: 0.5,
            onEnter: () => {
              gsap.to(element, { opacity: 1, y: 0, duration: 1, delay })
            },
            once: true,
          })
        })
      })
    }, 200)

    return () => {
      clearTimeout(timer)
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    }
  }, [pathname])
}
