import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import PlanDetails from './pages/PlanDetails';
import JoinPlan from './pages/JoinPlan';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plan/:planId" element={<PlanDetails />} />
        <Route path="/join/:inviteCode" element={<JoinPlan />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;