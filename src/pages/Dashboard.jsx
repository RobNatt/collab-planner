import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import CreatePlan from '../components/CreatePlan';
import PlansList from '../components/PlansList';
import UserProfileSetup from '../components/UserProfileSetup';
import { useUserProfile } from '../hooks/useUserProfile';

function Dashboard() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { profile, loading } = useUserProfile(auth.currentUser?.uid, refreshKey);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handlePlanCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleProfileComplete = () => {
    setShowProfileSetup(false);
    setRefreshKey(prev => prev + 1); // Refresh to load new profile
  };

  // Show profile setup if user doesn't have a profile
  useEffect(() => {
    if (!loading && !profile && !showProfileSetup) {
      setShowProfileSetup(true);
    }
  }, [loading, profile, showProfileSetup]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <>
      {showProfileSetup && <UserProfileSetup onComplete={handleProfileComplete} />}
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: '#f44336', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <CreatePlan onPlanCreated={handlePlanCreated} />
      <PlansList key={refreshKey} />
      </div>
    </div>
    </>
  );
}

export default Dashboard;