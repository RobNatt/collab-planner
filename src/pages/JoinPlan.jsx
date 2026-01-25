// ========================================
// IMPORTS
// ========================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { Skeleton, SkeletonText } from '../components/Skeleton';
import toast from 'react-hot-toast';

// ========================================
// MAIN COMPONENT
// ========================================
function JoinPlan() {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const { colors } = useTheme();

  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    if (!auth.currentUser) {
      navigate(`/?redirect=/join/${inviteCode}`);
      return;
    }
    fetchPlanByInviteCode();
  }, [inviteCode]);

  // ========================================
  // FETCH PLAN BY INVITE CODE
  // ========================================
  const fetchPlanByInviteCode = async () => {
    try {
      const q = query(
        collection(db, 'plans'),
        where('inviteCode', '==', inviteCode.toUpperCase())
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid invite code. This plan does not exist or the invite has expired.');
        setLoading(false);
        return;
      }

      const planDoc = querySnapshot.docs[0];
      const planData = { id: planDoc.id, ...planDoc.data() };

      if (planData.members.includes(auth.currentUser.uid)) {
        toast.success('You are already a member of this plan!');
        setTimeout(() => navigate(`/plan/${planData.id}`), 1500);
        setLoading(false);
        return;
      }

      setPlan(planData);
    } catch (error) {
      console.error('Error fetching plan:', error);
      setError(`Error loading plan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // JOIN PLAN HANDLER
  // ========================================
  const handleJoinPlan = async () => {
    setJoining(true);

    try {
      await updateDoc(doc(db, 'plans', plan.id), {
        members: arrayUnion(auth.currentUser.uid)
      });

      toast.success(`Successfully joined "${plan.name}"!`);
      navigate(`/plan/${plan.id}`);
    } catch (error) {
      console.error('Error joining plan:', error);
      toast.error('Error joining plan: ' + error.message);
    } finally {
      setJoining(false);
    }
  };

  // ========================================
  // LOADING STATE
  // ========================================
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        transition: 'background-color 0.3s ease',
      }}>
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <ThemeToggle />
        </div>
        <div style={{
          width: '100%',
          maxWidth: '600px',
          padding: '40px',
          backgroundColor: colors.cardBg,
          borderRadius: '16px',
          boxShadow: `0 4px 24px ${colors.shadow}`,
          textAlign: 'center',
        }}>
          <Skeleton width="60%" height="32px" style={{ margin: '0 auto 24px' }} />
          <div style={{
            backgroundColor: colors.backgroundTertiary,
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
          }}>
            <Skeleton width="80%" height="28px" style={{ margin: '0 auto 16px' }} />
            <SkeletonText lines={3} />
          </div>
          <Skeleton width="100%" height="52px" borderRadius="8px" />
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR STATE
  // ========================================
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        transition: 'background-color 0.3s ease',
      }}>
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <ThemeToggle />
        </div>
        <div
          className="animate-scaleIn"
          style={{
            width: '100%',
            maxWidth: '600px',
            padding: '40px',
            backgroundColor: colors.cardBg,
            borderRadius: '16px',
            boxShadow: `0 4px 24px ${colors.shadow}`,
            textAlign: 'center',
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: colors.dangerLight,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '40px',
          }}>
            ❌
          </div>
          <h2 style={{ color: colors.danger, marginBottom: '16px' }}>{error}</h2>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '16px',
              padding: '14px 32px',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
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
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER - JOIN CONFIRMATION
  // ========================================
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      transition: 'background-color 0.3s ease',
    }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <ThemeToggle />
      </div>
      <div
        className="animate-scaleIn"
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '40px',
          backgroundColor: colors.cardBg,
          borderRadius: '16px',
          boxShadow: `0 4px 24px ${colors.shadow}`,
        }}
      >
        <div style={{
          backgroundColor: `${colors.primary}15`,
          padding: '32px',
          borderRadius: '16px',
          textAlign: 'center',
          border: `1px solid ${colors.primary}30`,
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: colors.successLight,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '40px',
          }}>
            🎉
          </div>
          <h1 style={{ marginTop: 0, color: colors.text, marginBottom: '24px' }}>You've been invited!</h1>

          <div style={{
            backgroundColor: colors.cardBg,
            padding: '28px',
            borderRadius: '12px',
            marginBottom: '28px',
            border: `1px solid ${colors.border}`,
          }}>
            <h2 style={{ marginTop: 0, color: colors.primary, marginBottom: '12px' }}>{plan.name}</h2>
            {plan.description && (
              <p style={{ color: colors.textSecondary, marginBottom: '16px' }}>{plan.description}</p>
            )}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              color: colors.textMuted,
              fontSize: '14px',
            }}>
              <p style={{ margin: 0 }}>📅 {plan.startDate} to {plan.endDate}</p>
              <p style={{ margin: 0 }}>👥 {plan.members?.length || 0} member(s) already joined</p>
              <p style={{ margin: 0 }}>Created by: {plan.createdByEmail}</p>
            </div>
          </div>

          <button
            onClick={handleJoinPlan}
            disabled={joining}
            style={{
              padding: '16px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: joining ? colors.textMuted : colors.success,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: joining ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
              width: '100%',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!joining) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 16px ${colors.shadow}`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {joining ? 'Joining...' : 'Join This Plan'}
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: colors.primary,
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            No thanks, go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinPlan;
