import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { trackAdminCollaboratorPaymentCompleted } from '../utils/analytics';
import toast from 'react-hot-toast';

function InvitePaymentSuccess() {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId') || '';
  const sessionId = searchParams.get('session_id') || '';
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [working, setWorking] = useState(true);
  const [message, setMessage] = useState('Finalizing collaborator approval...');

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }
    if (!requestId || !sessionId) {
      setWorking(false);
      setMessage('Missing payment confirmation details.');
      return;
    }

    const run = async () => {
      try {
        const finalize = httpsCallable(functions, 'finalizeCollaboratorJoinAfterCheckout');
        const res = await finalize({ requestId, sessionId });
        const planId = res?.data?.planId;
        trackAdminCollaboratorPaymentCompleted(requestId, planId || 'unknown');
        toast.success('Collaborator payment accepted.');
        if (planId) {
          navigate(`/plan/${planId}`);
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error(error);
        setWorking(false);
        setMessage(error.message || 'Could not finalize collaborator approval.');
      }
    };
    run();
  }, [requestId, sessionId, navigate]);

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
        maxWidth: '560px',
        padding: '40px',
        borderRadius: '16px',
        backgroundColor: colors.cardBg,
        boxShadow: `0 4px 24px ${colors.shadow}`,
        textAlign: 'center',
      }}>
        <h1 style={{ marginTop: 0, color: colors.text }}>Processing payment result</h1>
        <p style={{ color: colors.textSecondary }}>{message}</p>
        {!working && (
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '14px',
              padding: '12px 22px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: colors.primary,
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Go to dashboard
          </button>
        )}
      </div>
    </div>
  );
}

export default InvitePaymentSuccess;
