import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import CreatePlan from '../components/CreatePlan';
import PlansList from '../components/PlansList';
import UserProfileSetup from '../components/UserProfileSetup';
import { useUserProfile } from '../hooks/useUserProfile';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { SkeletonList } from '../components/Skeleton';
import { useLicense } from '../hooks/useLicense';
import { LTDBadge } from '../components/LTDBadge';
import toast from 'react-hot-toast';

function Dashboard() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  /** undefined = auth still restoring; null = signed out; User = signed in */
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const { profile, loading: profileLoading } = useUserProfile(
    firebaseUser ? firebaseUser.uid : undefined,
    refreshKey
  );
  const loading = firebaseUser === undefined || (firebaseUser && profileLoading);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const setupDismissed = useRef(false);
  const { colors } = useTheme();
  const { isLTD, hasUnlimitedAccess } = useLicense(firebaseUser?.uid);

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
    setupDismissed.current = true;
    setShowProfileSetup(false);
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user ?? null);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (firebaseUser === null) {
      navigate('/login');
    }
  }, [firebaseUser, navigate]);

  useEffect(() => {
    if (firebaseUser === undefined || loading) return;
    if (profile) {
      setShowProfileSetup(false);
      return;
    }
    if (!showProfileSetup && !setupDismissed.current) {
      setShowProfileSetup(true);
    }
  }, [firebaseUser, loading, profile, showProfileSetup]);

  useEffect(() => {
    if (firebaseUser === undefined || loading) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'userProfiles', firebaseUser.uid));
        const rid = snap.data()?.restrictDashboardToPlanId;
        if (rid) {
          navigate(`/plan/${rid}`, { replace: true });
        }
      } catch {
        /* ignore */
      }
    })();
  }, [firebaseUser, loading, navigate]);

  if (firebaseUser === null) {
    return null;
  }

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

  const handleResendVerification = async () => {
    try {
      await sendEmailVerification(firebaseUser);
      toast.success('Verification email sent! Check your inbox.');
    } catch {
      toast.error('Please wait before requesting another email.');
    }
  };

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
          {firebaseUser && !firebaseUser.emailVerified && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: `${colors.warning}15`,
              border: `1px solid ${colors.warning}`,
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <span style={{ color: colors.text, fontSize: '14px' }}>
                Please verify your email address to secure your account.
              </span>
              <button
                onClick={handleResendVerification}
                style={{
                  padding: '6px 16px',
                  fontSize: '13px',
                  backgroundColor: colors.warning,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Resend Email
              </button>
            </div>
          )}
          {!hasUnlimitedAccess && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: `${colors.primary}10`,
              border: `1px solid ${colors.primary}30`,
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <span style={{ color: colors.text, fontSize: '14px' }}>
                ★ Unlock unlimited plans, members, and trip duration. Upgrade to a paid plan.
              </span>
              <button
                onClick={() => navigate('/#pricing')}
                style={{
                  padding: '6px 16px',
                  fontSize: '13px',
                  backgroundColor: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                View plans
              </button>
            </div>
          )}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  Welcome back, {profile.displayName}
                  {isLTD && <LTDBadge />}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => navigate('/profile')}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: profile?.avatarColor || colors.primary,
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title="View Profile"
              >
                {profile?.displayName ? profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
              </button>
              <button
                onClick={() => navigate('/affiliate-dashboard')}
                title="Affiliate Dashboard"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: colors.backgroundTertiary,
                  color: colors.textSecondary,
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                  e.currentTarget.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
                  e.currentTarget.style.color = colors.textSecondary;
                }}
              >
                🤝
              </button>
              <button
                onClick={() => navigate('/feedback')}
                title="Feedback"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: colors.backgroundTertiary,
                  color: colors.textSecondary,
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                  e.currentTarget.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
                  e.currentTarget.style.color = colors.textSecondary;
                }}
              >
                💬
              </button>
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
