import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Service from './pages/Service'
import ServiceDetails from './pages/ServiceDetails'
import GovernmentSchemes from './pages/GovernmentSchemes'
import GovernmentSchemeDetail from './pages/GovernmentSchemeDetail'
import Contact from './pages/Contact'
import SelectProject from './pages/SelectProject'
import BusinessAssociate from './pages/BusinessAssociate'
import BecomeInvestor from './pages/BecomeInvestor'
import Error from './pages/Error'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import AdminLogin from './pages/admin/AdminLogin'
import AdminRedirect from './pages/admin/AdminRedirect'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProjectInquiries from './pages/admin/AdminProjectInquiries'
import AdminProjects from './pages/admin/AdminProjects'
import AdminProjectDetail from './pages/admin/AdminProjectDetail'
import AdminInvestors from './pages/admin/AdminInvestors'
import AdminInvestorDetail from './pages/admin/AdminInvestorDetail'
import AdminBusinessAssociates from './pages/admin/AdminBusinessAssociates'
import AdminBusinessAssociateDetail from './pages/admin/AdminBusinessAssociateDetail'
import AdminBusinessAssociateManagement from './pages/admin/AdminBusinessAssociateManagement'
import AdminContactManagement from './pages/admin/AdminContactManagement'
import AdminServiceManagement from './pages/admin/AdminServiceManagement'
import AdminServiceDetail from './pages/admin/AdminServiceDetail'
import AdminGovernmentSchemeManagement from './pages/admin/AdminGovernmentSchemeManagement'
import AdminGovernmentSchemeDetail from './pages/admin/AdminGovernmentSchemeDetail'
import AdminServiceView from './pages/admin/AdminServiceView'
import AdminGovernmentSchemeView from './pages/admin/AdminGovernmentSchemeView'

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminRedirect />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/project-inquiries" element={<AdminProjectInquiries />} />
      <Route path="/admin/projects" element={<AdminProjects />} />
      <Route path="/admin/projects/:projectId" element={<AdminProjectDetail />} />
      <Route path="/admin/investors" element={<AdminInvestors />} />
      <Route path="/admin/investors/:investorId" element={<AdminInvestorDetail />} />
      <Route path="/admin/business-associates" element={<AdminBusinessAssociates />} />
      <Route path="/admin/business-associates/:associateId" element={<AdminBusinessAssociateDetail />} />
      <Route path="/admin/business-associate-management" element={<AdminBusinessAssociateManagement />} />
      <Route path="/admin/contact-us" element={<AdminContactManagement />} />
      <Route path="/admin/services" element={<AdminServiceManagement />} />
      <Route path="/admin/services/:serviceId" element={<AdminServiceDetail />} />
      <Route path="/admin/services/:serviceId/view" element={<AdminServiceView />} />
      <Route path="/admin/government-schemes" element={<AdminGovernmentSchemeManagement />} />
      <Route path="/admin/government-schemes/:schemeId" element={<AdminGovernmentSchemeDetail />} />
      <Route path="/admin/government-schemes/:schemeId/view" element={<AdminGovernmentSchemeView />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/service" element={<Service />} />
        <Route path="/service-details" element={<ServiceDetails />} />
        <Route path="/government-schemes" element={<GovernmentSchemes />} />
        <Route path="/government-schemes/:schemeId" element={<GovernmentSchemeDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/select-project" element={<SelectProject />} />
        <Route path="/business-associate" element={<BusinessAssociate />} />
        <Route path="/become-investor" element={<BecomeInvestor />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="*" element={<Error />} />
      </Route>
    </Routes>
  )
}

export default App
