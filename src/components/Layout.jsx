import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Preloader from './Preloader'
import SearchPopup from './SearchPopup'
import Sidebar from './Sidebar'
import ScrollToTop from './ScrollToTop'

// Bootstrap JS for tabs and accordions
import 'bootstrap/js/dist/tab'
import 'bootstrap/js/dist/collapse'

// Custom hooks
import useDataBackground from '../hooks/useDataBackground'
import useStickyHeader from '../hooks/useStickyHeader'
import useScrollToTop from '../hooks/useScrollToTop'
import useOdometer from '../hooks/useOdometer'
import useTextAnimation from '../hooks/useTextAnimation'
import useImageReveal from '../hooks/useImageReveal'
import useFadeWrapper from '../hooks/useFadeWrapper'
import useCustomCursor from '../hooks/useCustomCursor'

function Layout() {
  useDataBackground()
  useStickyHeader()
  useScrollToTop()
  useOdometer()
  useTextAnimation()
  useImageReveal()
  useFadeWrapper()
  useCustomCursor()

  return (
    <>
      <Preloader />
      <SearchPopup />
      <div id="sidebar-overlay" onClick={() => document.body.classList.remove('open-sidebar')} />
      <Sidebar />
      <Header />
      <Outlet />
      <Footer />
      <ScrollToTop />
    </>
  )
}

export default Layout
