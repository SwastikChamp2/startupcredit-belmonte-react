import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function useTextAnimation() {
  const { pathname } = useLocation()

  useEffect(() => {
    const gsap = window.gsap
    const ScrollTrigger = window.ScrollTrigger
    const SplitType = window.SplitType
    if (!gsap || !ScrollTrigger || !SplitType) return

    gsap.registerPlugin(ScrollTrigger)

    const timer = setTimeout(() => {
      // Split text elements
      new SplitType('[data-text-animation]', {
        types: 'lines, words, chars',
        className: 'line',
      })

      const animations = document.querySelectorAll('[data-text-animation]')

      function createScrollTrigger(triggerElement, timeline) {
        ScrollTrigger.create({
          trigger: triggerElement,
          start: 'top 80%',
          onEnter: () => timeline.play(),
          toggleClass: { targets: triggerElement, className: 'active' },
        })
      }

      animations.forEach((animation) => {
        let type = animation.getAttribute('data-text-animation') || 'slide-up'
        let duration = parseFloat(animation.getAttribute('data-duration')) || 0.75
        let offset = parseFloat(animation.getAttribute('data-offset')) || 80
        let stagger = parseFloat(animation.getAttribute('data-stagger')) || 0.6
        let ease = animation.getAttribute('data-ease') || 'power2.out'
        let split = animation.getAttribute('data-split') || 'line'
        let scroll = animation.getAttribute('data-scroll')
        scroll = scroll === '0' ? 0 : 1

        const targets = animation.querySelectorAll(`.${split}`)
        if (!targets.length) return

        if (scroll === 1) {
          let tl = gsap.timeline({ paused: true })

          switch (type) {
            case 'slide-up':
              tl.from(targets, { yPercent: offset, duration, ease, opacity: 0, stagger: { amount: stagger } })
              break
            case 'slide-down':
              tl.from(targets, { yPercent: -offset, duration, ease, opacity: 0, stagger: { amount: stagger } })
              break
            case 'rotate-in':
              tl.set(targets, { transformPerspective: 400 })
              tl.from(targets, { rotationX: -offset, duration, ease, force3D: true, opacity: 0, transformOrigin: 'top center -50', stagger: { amount: stagger } })
              break
            case 'slide-from-left':
              tl.from(targets, { xPercent: -offset, duration, ease, opacity: 0, stagger: { amount: stagger } })
              break
            case 'slide-from-right':
              tl.from(targets, { xPercent: offset, duration, ease, opacity: 0, stagger: { amount: stagger } })
              break
            case 'fade-in':
              tl.from(targets, { opacity: 0, duration, ease, stagger: { amount: stagger } })
              break
            case 'fade-in-random':
              tl.from(targets, { opacity: 0, duration, ease, stagger: { amount: stagger, from: 'random' } })
              break
            case 'scrub': {
              gsap.timeline({
                scrollTrigger: { trigger: animation, start: 'top 90%', end: 'top center', scrub: true },
              }).from(targets, { opacity: 0.2, duration, ease, stagger: { amount: stagger } })
              return
            }
            default:
              tl.from(targets, { yPercent: offset, duration, ease, opacity: 0, stagger: { amount: stagger } })
          }

          createScrollTrigger(animation, tl)
        }
      })

      // Avoid flash of unstyled content
      gsap.set('[data-text-animation]', { opacity: 1 })

      // Text animation effect (hero text)
      const textEffectEls = document.querySelectorAll('.text-animation-effect')
      if (textEffectEls.length) {
        new SplitType('.text-animation-effect', { types: 'chars' })
        const chars = document.querySelectorAll('.text-animation-effect .char')
        if (chars.length) {
          gsap.from(chars, { duration: 1, x: 100, autoAlpha: 0, stagger: 0.1 })
        }
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
