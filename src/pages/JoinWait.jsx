import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { SkeletonText } from '../components/Skeleton';

function JoinWait() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Please wait while your acceptance is acknowledged by the administrator.');
  const [status, setStatus] = useState('pending_admin_payment');

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }
    if (!requestId) {
      navigate('/dashboard');
      return;
    }

    const ref = doc(db, 'collaboratorJoinRequests', requestId);
    const unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        setStatus('missing');
        setMessage('We could not find this collaborator request. Please try the invite link again.');
        setLoading(false);
        return;
      }

      const data = snap.data();
      if (data.collaboratorUid !== auth.currentUser.uid) {
        setStatus('forbidden');
        setMessage('This waiting room belongs to a different user.');
        setLoading(false);
        return;
      }

      setStatus(data.status || 'pending_admin_payment');
      if (data.status === 'paid') {
        const profileSnap = await getDoc(doc(db, 'userProfiles', auth.currentUser.uid));
        const tutorialDone = profileSnap.data()?.tutorialCompleted;
        if (!tutorialDone) {
          navigate(`/welcome?collaborator=1&plan=${data.planId}`);
        } else {
          navigate(`/plan/${data.planId}`);
        }
        return;
      }
      if (data.status === 'rejected') {
        setMessage('The administrator declined this collaborator request.');
      } else {
        setMessage('Please wait while your acceptance is acknowledged by the administrator. We will continue automatically as soon as payment is approved.');
      }
      setLoading(false);
    });

    return () => unsub();
  }, [requestId, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
    }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <ThemeToggle />
      </div>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        padding: '40px',
        borderRadius: '16px',
        backgroundColor: colors.cardBg,
        boxShadow: `0 4px 24px ${colors.shadow}`,
        textAlign: 'center',
      }}>
        <h1 style={{ color: colors.text, marginTop: 0 }}>Join request submitted</h1>
        {loading ? (
          <SkeletonText lines={3} />
        ) : (
          <>
            <p style={{ color: colors.textSecondary, lineHeight: 1.55 }}>{message}</p>
            {status !== 'pending_admin_payment' && status !== 'paid' && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  marginTop: '12px',
                  padding: '12px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: colors.primary,
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Back to dashboard
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default JoinWait;
