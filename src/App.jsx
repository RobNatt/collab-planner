import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import PlanDetails from './pages/PlanDetails';
import JoinPlan from './pages/JoinPlan';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import Feedback from './pages/Feedback';
import PurchaseSuccess from './pages/PurchaseSuccess';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/purchase-success" element={<PurchaseSuccess />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/plan/:planId" element={<PlanDetails />} />
        <Route path="/join/:inviteCode" element={<JoinPlan />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;