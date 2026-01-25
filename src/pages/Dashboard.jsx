import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import CreatePlan from '../components/CreatePlan';
import PlansList from '../components/PlansList';
import UserProfileSetup from '../components/UserProfileSetup';
import { useUserProfile } from '../hooks/useUserProfile';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { SkeletonList } from '../components/Skeleton';
import toast from 'react-hot-toast';

function Dashboard() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { profile, loading } = useUserProfile(auth.currentUser?.uid, refreshKey);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { colors } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to log out');
    }
  };

  const handlePlanCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleProfileComplete = () => {
    setShowProfileSetup(false);
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    if (!loading && !profile && !showProfileSetup) {
      setShowProfileSetup(true);
    }
  }, [loading, profile, showProfileSetup]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
        transition: 'background-color 0.3s ease',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          padding: '40px',
          backgroundColor: colors.cardBg,
          borderRadius: '12px',
          boxShadow: `0 2px 8px ${colors.shadow}`,
          transition: 'all 0.3s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '200px',
              height: '36px',
              backgroundColor: colors.skeleton,
              borderRadius: '8px',
              animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
              backgroundSize: '200% 100%',
              background: `linear-gradient(90deg, ${colors.skeleton} 25%, ${colors.skeletonShine} 50%, ${colors.skeleton} 75%)`,
            }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                backgroundColor: colors.skeleton,
                borderRadius: '12px',
              }} />
              <div style={{
                width: '100px',
                height: '44px',
                backgroundColor: colors.skeleton,
                borderRadius: '8px',
              }} />
            </div>
          </div>
          <SkeletonList count={3} />
        </div>
      </div>
    );
  }

  return (
    <>
      {showProfileSetup && <UserProfileSetup onComplete={handleProfileComplete} />}
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
        transition: 'background-color 0.3s ease',
      }}>
        <div
          className="animate-fadeIn"
          style={{
            width: '100%',
            maxWidth: '1200px',
            padding: '40px',
            backgroundColor: colors.cardBg,
            borderRadius: '12px',
            boxShadow: `0 2px 8px ${colors.shadow}`,
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div>
              <h1 style={{
                color: colors.text,
                margin: 0,
                fontSize: '2rem',
              }}>
                Dashboard
              </h1>
              {profile?.displayName && (
                <p style={{
                  color: colors.textSecondary,
                  margin: '4px 0 0 0',
                  fontSize: '1rem',
                }}>
                  Welcome back, {profile.displayName}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: colors.danger,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Logout
              </button>
            </div>
          </div>

          <CreatePlan onPlanCreated={handlePlanCreated} />
          <PlansList key={refreshKey} />
        </div>
      </div>
    </>
  );
}

export default Dashboard;
