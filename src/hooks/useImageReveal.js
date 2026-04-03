import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function useImageReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    const gsap = window.gsap
    const ScrollTrigger = window.ScrollTrigger
    if (!gsap || !ScrollTrigger) return
    gsap.registerPlugin(ScrollTrigger)

    const timer = setTimeout(() => {
      const observers = []

      // .img-reveal elements
      const imgRevealEls = document.querySelectorAll('.img-reveal')
      imgRevealEls.forEach((image) => {
        gsap.set(image, { visibility: 'visible' })

        const overlay = image.querySelector('.img-overlay')
        const img = image.querySelector('img')
        if (!overlay || !img) return

        const masterTL = gsap.timeline({ paused: true })
        masterTL
          .to(overlay, { duration: 1.4, ease: 'Power2.easeInOut', width: '0%' })
          .from(img, { duration: 1.4, scale: 1.4, ease: 'Power2.easeInOut' }, '-=1.4')

        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              masterTL.play()
            } else {
              masterTL.progress(0).pause()
            }
          })
        }, { threshold: 0 })

        io.observe(image)
        observers.push(io)
      })

      // .reveal elements
      const revealEls = document.querySelectorAll('.reveal')
      revealEls.forEach((container) => {
        const img = container.querySelector('img')
        if (!img) return

        gsap.timeline({
          scrollTrigger: {
            trigger: container,
            toggleActions: 'restart none none reset',
          },
        })
          .set(container, { autoAlpha: 1 })
          .from(container, { duration: 1.5, xPercent: -100, ease: 'power2.out' })
          .from(img, { duration: 1.5, xPercent: 100, scale: 1.3, delay: -1.5, ease: 'power2.out' })
      })

      return () => {
        observers.forEach((io) => io.disconnect())
      }
    }, 200)

    return () => {
      clearTimeout(timer)
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    }
  }, [pathname])
}
