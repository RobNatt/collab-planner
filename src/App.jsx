import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PlanDetails from './pages/PlanDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plan/:planId" element={<PlanDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;