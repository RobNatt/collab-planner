import { useMemo } from 'react';
import { updateDoc, doc, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useUserProfiles } from '../hooks/useUserProfile';
import { getUserDisplayName } from '../utils/userHelpers';

function MembersList({ plan, onMemberRemoved }) {
  const memberIds = useMemo(() => plan?.members || [], [plan]);
  const { profiles, loading } = useUserProfiles(memberIds);

  const members = useMemo(() => (
    memberIds.map((memberId) => {
      const profile = profiles?.[memberId] || {};
      const displayName = getUserDisplayName(memberId, profiles, auth.currentUser?.uid);
      const email = profile.email || (memberId === plan.createdBy ? plan.createdByEmail : '');
      return {
        id: memberId,
        displayName,
        email,
        isAdmin: memberId === plan.admin,
      };
    })
  ), [memberIds, profiles, plan.admin, plan.createdBy, plan.createdByEmail]);

  const handleRemoveMember = async (memberId) => {
    if (memberId === plan.admin) {
      alert("Cannot remove the admin!");
      return;
    }

    if (!window.confirm('Remove this member from the plan?')) {
      return;
    }

    try {
      await updateDoc(doc(db, 'plans', plan.id), {
        members: arrayRemove(memberId)
      });

      alert('Member removed successfully');
      if (onMemberRemoved) onMemberRemoved();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Error removing member: ' + error.message);
    }
  };

  const handleLeavePlan = async () => {
    if (!window.confirm(`Are you sure you want to leave "${plan.name}"? You'll need a new invite to rejoin.`)) {
      return;
    }

    try {
      await updateDoc(doc(db, 'plans', plan.id), {
        members: arrayRemove(auth.currentUser.uid)
      });

      alert('You have left the plan successfully');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error leaving plan:', error);
      alert('Error leaving plan: ' + error.message);
    }
  };

  if (loading) return <div>Loading members...</div>;

  const isCurrentUserAdmin = plan.admin === auth.currentUser.uid;

  return (
    <div style={{
      backgroundColor: '#f9f9f9',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Members ({members.length})</h3>
        {!isCurrentUserAdmin && (
          <button
            onClick={handleLeavePlan}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🚪 Leave Plan
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {members.map(member => (
          <div 
            key={member.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #ddd'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#4CAF50',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {(member.displayName || member.email || 'M')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>{member.displayName || member.email || 'Member'}</div>
                {member.email && member.email !== member.displayName && (
                  <div style={{ fontSize: '12px', color: '#666' }}>{member.email}</div>
                )}
                {member.isAdmin && (
                  <span style={{
                    fontSize: '12px',
                    color: '#4CAF50',
                    fontWeight: 'bold'
                  }}>
                    ADMIN
                  </span>
                )}
              </div>
            </div>
            
            {isCurrentUserAdmin && member.id !== plan.admin && (
              <button
                onClick={() => handleRemoveMember(member.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MembersList;