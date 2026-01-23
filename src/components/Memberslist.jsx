import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

function MembersList({ plan, onMemberRemoved }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [plan.members]);

  const fetchMembers = async () => {
    try {
      // For now, we only have user IDs. In a real app, you'd fetch user profiles
      // For this version, we'll just show the member UIDs and the creator's email
      const memberList = plan.members.map(memberId => ({
        id: memberId,
        email: memberId === plan.createdBy ? plan.createdByEmail : 'Member',
        isAdmin: memberId === plan.admin
      }));
      
      setMembers(memberList);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) return <div>Loading members...</div>;

  return (
    <div style={{
      backgroundColor: '#f9f9f9',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3>Members ({members.length})</h3>
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
                {member.email[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>{member.email}</div>
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
            
            {plan.admin === auth.currentUser.uid && member.id !== plan.admin && (
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