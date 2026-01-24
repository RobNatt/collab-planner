// ========================================
// IMPORTS
// ========================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

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

  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    if (!auth.currentUser) {
      // Redirect to login if not authenticated
      navigate(`/?redirect=/join/${inviteCode}`);
      return;
    }

    console.log('Not authenticated, redirecting with inviteCode:', inviteCode);
    fetchPlanByInviteCode();
  }, [inviteCode]);

  // ========================================
  // FETCH PLAN BY INVITE CODE
  // ========================================
  const fetchPlanByInviteCode = async () => {
    try {
      console.log('Fetching plan with invite code:', inviteCode.toUpperCase());

      const q = query(
        collection(db, 'plans'),
        where('inviteCode', '==', inviteCode.toUpperCase())
      );

      const querySnapshot = await getDocs(q);

      console.log('Query result - empty?', querySnapshot.empty);
      console.log('Query result - size:', querySnapshot.size);

      if (querySnapshot.empty) {
        setError('Invalid invite code. This plan does not exist or the invite has expired.');
        setLoading(false);
        return;
      }

      const planDoc = querySnapshot.docs[0];
      const planData = { id: planDoc.id, ...planDoc.data() };

      console.log('Plan found:', planData.name);

      // Check if user is already a member
      if (planData.members.includes(auth.currentUser.uid)) {
        setError('You are already a member of this plan!');
        setTimeout(() => navigate(`/plan/${planData.id}`), 2000);
        setLoading(false);
        return;
      }

      setPlan(planData);
    } catch (error) {
      console.error('Error fetching plan - Full error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setError(`Error loading plan: ${error.message}. Check console for details.`);
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

      alert(`Successfully joined "${plan.name}"!`);
      navigate(`/plan/${plan.id}`);
    } catch (error) {
      console.error('Error joining plan:', error);
      alert('Error joining plan: ' + error.message);
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
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '600px',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2>Loading invite...</h2>
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
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '600px',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#f44336' }}>❌ {error}</h2>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
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
      backgroundColor: '#f5f5f5',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
        <h1 style={{ marginTop: 0 }}>🎉 You've been invited!</h1>
        
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '25px'
        }}>
          <h2 style={{ marginTop: 0, color: '#2196F3' }}>{plan.name}</h2>
          {plan.description && (
            <p style={{ color: '#666', marginBottom: '15px' }}>{plan.description}</p>
          )}
          <p style={{ color: '#888', fontSize: '14px' }}>
            📅 {plan.startDate} to {plan.endDate}
          </p>
          <p style={{ color: '#888', fontSize: '14px' }}>
            👥 {plan.members?.length || 0} member(s) already joined
          </p>
          <p style={{ color: '#888', fontSize: '14px' }}>
            Created by: {plan.createdByEmail}
          </p>
        </div>

        <button
          onClick={handleJoinPlan}
          disabled={joining}
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: joining ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: joining ? 'not-allowed' : 'pointer',
            marginBottom: '15px',
            width: '100%'
          }}
        >
          {joining ? 'Joining...' : 'Join This Plan'}
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: '#2196F3',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline'
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