import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Service from './pages/Service'
import ServiceDetails from './pages/ServiceDetails'
import Contact from './pages/Contact'
import SelectProject from './pages/SelectProject'
import BusinessAssociate from './pages/BusinessAssociate'
import Error from './pages/Error'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/service" element={<Service />} />
        <Route path="/service-details" element={<ServiceDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/select-project" element={<SelectProject />} />
        <Route path="/business-associate" element={<BusinessAssociate />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="*" element={<Error />} />
      </Route>
    </Routes>
  )
}

export default App
