import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar              from './components/Navbar'
import Hero                from './components/Hero'
import Clients             from './components/Clients'
import Services            from './components/Services'
import Solution            from './components/Solution'
import FounderTools        from './components/FounderTools'
import Process             from './components/Process'
import TechStack           from './components/TechStack'
import About               from './components/About'
import Testimonials        from './components/Testimonials'
import FAQ                 from './components/FAQ'
import Contact             from './components/Contact'
import Footer              from './components/Footer'
import ScrollToTop         from './components/ScrollToTop'
import CursorGlow          from './components/CursorGlow'
import RouteTracker        from './components/RouteTracker'
import ErrorBoundary       from './components/ErrorBoundary'
import usePageMeta         from './hooks/usePageMeta'

const CaseStudyStaffing      = lazy(() => import('./pages/CaseStudyStaffing'))
const CaseStudyHSO           = lazy(() => import('./pages/CaseStudyHSO'))
const CaseStudyRolexAds      = lazy(() => import('./pages/CaseStudyRolexAds'))
const CaseStudyMediaManager  = lazy(() => import('./pages/CaseStudyMediaManager'))
const Login                 = lazy(() => import('./pages/Login'))
const Signup                = lazy(() => import('./pages/Signup'))
const Dashboard             = lazy(() => import('./pages/Dashboard'))
const CostEstimator         = lazy(() => import('./pages/CostEstimator'))
const ROICalculator         = lazy(() => import('./pages/ROICalculator'))
const TimelineCalculator    = lazy(() => import('./pages/TimelineCalculator'))
const TechRecommender       = lazy(() => import('./pages/TechRecommender'))
const Pricing               = lazy(() => import('./pages/Pricing'))
const PMDashboard           = lazy(() => import('./pages/pm/PMDashboard'))
const NewProject            = lazy(() => import('./pages/pm/NewProject'))
const ProjectDetail         = lazy(() => import('./pages/pm/ProjectDetail'))
const ClientView            = lazy(() => import('./pages/pm/ClientView'))
const JoinProject           = lazy(() => import('./pages/pm/JoinProject'))
const ReferralPage          = lazy(() => import('./pages/pm/ReferralPage'))
const InvoiceGenerator      = lazy(() => import('./pages/pm/InvoiceGenerator'))
const PublicShowcase        = lazy(() => import('./pages/pm/PublicShowcase'))
const PaymentDemo            = lazy(() => import('./pages/PaymentDemo'))
const NotFound               = lazy(() => import('./pages/NotFound'))

function PMRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-black" />
  return <Navigate to={user ? '/pm/dashboard' : '/signup'} replace />
}

function Home() {
  usePageMeta({
    title:       'Vikku - Software & Tech Agency | Web Apps, Platforms & Digital Products',
    description: 'Vikku is a software & tech agency that builds web apps, staffing platforms, e-commerce stores, and custom digital products. Based in India, serving clients globally.',
    url:         'https://vikku.in/',
  })

  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <Navbar />
      <main>
        <Hero />
        <Clients />
        <Services />
        <FounderTools />
        <Solution />
        <Process />
        <TechStack />
        <About />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteTracker />
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <Routes>
              <Route path="/"                        element={<Home />} />
              <Route path="/login"                   element={<Login />} />
              <Route path="/signup"                  element={<Signup />} />
              <Route path="/dashboard"               element={<Dashboard />} />
              <Route path="/dashboard/cost-estimator"    element={<CostEstimator />} />
              <Route path="/dashboard/roi-calculator"     element={<ROICalculator />} />
              <Route path="/dashboard/timeline-calculator" element={<TimelineCalculator />} />
              <Route path="/dashboard/tech-recommender"   element={<TechRecommender />} />
              <Route path="/tools"                        element={<Pricing />} />
              <Route path="/pm"                          element={<PMRedirect />} />
              <Route path="/pm/dashboard"               element={<PMDashboard />} />
              <Route path="/pm/projects/new"            element={<NewProject />} />
              <Route path="/pm/projects/:id"            element={<ProjectDetail />} />
              <Route path="/pm/share/:token"            element={<ClientView />} />
              <Route path="/pm/join/:projectId"         element={<JoinProject />} />
              <Route path="/pm/refer"                       element={<ReferralPage />} />
              <Route path="/pm/projects/:id/invoice"    element={<InvoiceGenerator />} />
              <Route path="/showcase/:token"            element={<PublicShowcase />} />
              <Route path="/work/staffing-platform"       element={<CaseStudyStaffing />} />
              <Route path="/work/hso-cctv"           element={<CaseStudyHSO />} />
              <Route path="/work/rolex-ads"          element={<CaseStudyRolexAds />} />
              <Route path="/work/media-manager"      element={<CaseStudyMediaManager />} />
              <Route path="/payment-demo"            element={<PaymentDemo />} />
              <Route path="*"                        element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}
