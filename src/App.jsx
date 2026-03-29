import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnalyticsTracker } from './components/AnalyticsTracker';

const Landing = lazy(() => import('./pages/Landing'));
const DemoTrip = lazy(() => import('./pages/DemoTrip'));
const Login = lazy(() => import('./pages/Login'));
const Welcome = lazy(() => import('./pages/Welcome'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PlanDetails = lazy(() => import('./pages/PlanDetails'));
const JoinPlan = lazy(() => import('./pages/JoinPlan'));
const JoinWait = lazy(() => import('./pages/JoinWait'));
const InviteLanding = lazy(() => import('./pages/InviteLanding'));
const InvitePaymentSuccess = lazy(() => import('./pages/InvitePaymentSuccess'));
const Profile = lazy(() => import('./pages/Profile'));
const Pricing = lazy(() => import('./pages/Pricing'));
const PlanPage = lazy(() => import('./pages/PlanPage'));
const LTD = lazy(() => import('./pages/LTD'));
const Feedback = lazy(() => import('./pages/Feedback'));
const PurchaseSuccess = lazy(() => import('./pages/PurchaseSuccess'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Affiliates = lazy(() => import('./pages/Affiliates'));
const AffiliateDashboard = lazy(() => import('./pages/AffiliateDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const MarketingUiMocks = lazy(() => import('./pages/MarketingUiMocks'));

function routeLoadingFallback() {
  return (
    <div
      style={{
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '15px',
        color: '#64748b',
      }}
    >
      Loading…
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={routeLoadingFallback()}>
        <AnalyticsTracker />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/demo" element={<DemoTrip />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/plans/:planSlug" element={<PlanPage />} />
          <Route path="/ltd" element={<LTD />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/purchase-success" element={<PurchaseSuccess />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/affiliates" element={<Affiliates />} />
          <Route path="/affiliate-dashboard" element={<AffiliateDashboard />} />
          <Route path="/plan/:planId" element={<PlanDetails />} />
          <Route path="/invite/:inviteCode" element={<InviteLanding />} />
          <Route path="/join/:inviteCode" element={<JoinPlan />} />
          <Route path="/join/wait/:requestId" element={<JoinWait />} />
          <Route path="/invite-payment/success" element={<InvitePaymentSuccess />} />
          <Route path="/marketing-ui-mocks" element={<MarketingUiMocks />} />
          <Route path="/ui-mocks" element={<MarketingUiMocks />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
