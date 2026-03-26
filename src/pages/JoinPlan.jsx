import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db, auth, functions } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { Skeleton, SkeletonText } from '../components/Skeleton';
import { logMemberJoined } from '../utils/activityLogger';
import { trackInviteAccepted } from '../utils/analytics';
import { AUTO_JOIN_KEY } from './InviteLanding';
import toast from 'react-hot-toast';

function JoinPlan() {
  const { inviteCode: rawCode } = useParams();
  const inviteCode = rawCode?.toUpperCase() || '';
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const { colors } = useTheme();
  const autoJoinTried = useRef(false);

  const fetchPlanByInviteCode = useCallback(async (uid) => {
    if (!inviteCode) {
      setError('Invalid invite code.');
      setLoading(false);
      return;
    }
    try {
      const q = query(
        collection(db, 'plans'),
        where('inviteCode', '==', inviteCode)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid invite code. This plan does not exist or the invite has expired.');
        setLoading(false);
        return;
      }

      const planDoc = querySnapshot.docs[0];
      const planData = { id: planDoc.id, ...planDoc.data() };

      if (planData.members.includes(uid)) {
        try {
          sessionStorage.removeItem(AUTO_JOIN_KEY);
        } catch (_) { /* ignore */ }
        toast.success('You are already a member of this plan!');
        setTimeout(() => navigate(`/plan/${planData.id}`), 800);
        setLoading(false);
        return;
      }

      if (planData.inviteExpiresAt) {
        const expiresAt = planData.inviteExpiresAt.toDate
          ? planData.inviteExpiresAt.toDate()
          : new Date(planData.inviteExpiresAt);
        if (new Date() > expiresAt) {
          setError('This invite link has expired. Ask the plan admin for a new one.');
          setLoading(false);
          return;
        }
      }

      if (planData.inviteMaxUses && planData.inviteMaxUses > 0) {
        if ((planData.inviteUseCount || 0) >= planData.inviteMaxUses) {
          setError('This invite link has reached its usage limit. Ask the plan admin for a new one.');
          setLoading(false);
          return;
        }
      }

      setPlan(planData);
    } catch (err) {
      console.error('Error fetching plan:', err);
      setError(`Error loading plan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [inviteCode, navigate]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate(`/invite/${inviteCode}`, { replace: true });
        return;
      }
      setLoading(true);
      setError('');
      setPlan(null);
      fetchPlanByInviteCode(user.uid);
    });
    return () => unsub();
  }, [inviteCode, navigate, fetchPlanByInviteCode]);

  const finishJoinRouting = useCallback(async (planId) => {
    await setDoc(
      doc(db, 'userProfiles', auth.currentUser.uid),
      { restrictDashboardToPlanId: planId },
      { merge: true }
    );

    logMemberJoined(planId);

    const profileSnap = await getDoc(doc(db, 'userProfiles', auth.currentUser.uid));
    const tutorialDone = profileSnap.data()?.tutorialCompleted;
    if (!tutorialDone) {
      navigate(`/welcome?collaborator=1&plan=${planId}`);
    } else {
      navigate(`/plan/${planId}`);
    }
  }, [navigate]);

  const handleJoinPlan = useCallback(async () => {
    if (!plan || !auth.currentUser) return;
    try {
      sessionStorage.removeItem(AUTO_JOIN_KEY);
    } catch (_) { /* ignore */ }

    setJoining(true);
    try {
      const createJoinRequest = httpsCallable(functions, 'createCollaboratorJoinRequest');
      const result = await createJoinRequest({
        inviteCode,
        collaboratorName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'A collaborator',
      });
      const payload = result?.data || {};
      const mode = payload.mode;
      const targetPlanId = payload.planId || plan.id;

      if (mode === 'already_member') {
        toast.success('You are already a member of this plan.');
        navigate(`/plan/${targetPlanId}`);
        return;
      }

      if (mode === 'joined') {
        toast.success(`Successfully joined "${plan.name}"!`);
        trackInviteAccepted(targetPlanId, 'joined');
        await finishJoinRouting(targetPlanId);
        return;
      }

      if (mode === 'pending_payment') {
        const requestId = payload.requestId;
        if (!requestId) {
          throw new Error('Join request was created without a request ID.');
        }
        trackInviteAccepted(targetPlanId, 'pending_payment');
        toast.success('Request sent. Waiting for admin payment approval.');
        navigate(`/join/wait/${requestId}`);
        return;
      }

      throw new Error('Unexpected join response from server.');
    } catch (err) {
      console.error('Error joining plan:', err);
      toast.error('Error joining plan: ' + err.message);
    } finally {
      setJoining(false);
    }
  }, [plan, inviteCode, navigate, finishJoinRouting]);

  useEffect(() => {
    if (loading || error || !plan || joining) return;
    const user = auth.currentUser;
    if (!user || plan.members.includes(user.uid)) return;
    let pending = '';
    try {
      pending = sessionStorage.getItem(AUTO_JOIN_KEY) || '';
    } catch {
      return;
    }
    if (pending !== inviteCode) return;
    if (autoJoinTried.current) return;
    autoJoinTried.current = true;
    void handleJoinPlan();
  }, [loading, error, plan, joining, inviteCode, handleJoinPlan]);

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
            type="button"
            onClick={() => navigate(`/invite/${inviteCode}`)}
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
          >
            Back to invite
          </button>
        </div>
      </div>
    );
  }

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
          <h1 style={{ marginTop: 0, color: colors.text, marginBottom: '16px' }}>Ready to join</h1>
          <p style={{ color: colors.textSecondary, marginBottom: '24px', lineHeight: 1.5 }}>
            Confirm to request access. If this organizer is on an individual plan, they must acknowledge and pay the collaborator fee before you can continue.
          </p>

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
              <p style={{ margin: 0 }}>Organizer: {plan.createdByEmail}</p>
            </div>
          </div>

          <button
            type="button"
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
          >
            {joining ? 'Submitting request...' : 'Yes — continue'}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/invite/${inviteCode}`)}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: colors.primary,
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Back to invite details
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinPlan;
