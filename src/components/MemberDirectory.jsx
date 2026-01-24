import { useUserProfiles } from '../hooks/useUserProfile';
import { auth } from '../config/firebase';

function MemberDirectory({ plan }) {
  const { profiles, loading } = useUserProfiles(plan.members);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading members...</div>;
  }

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>👥 Trip Directory</h3>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
        Quick access to contact information for all trip members
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {plan.members.map(memberId => {
          const profile = profiles[memberId];
          const isCurrentUser = memberId === auth.currentUser.uid;
          const isAdmin = memberId === plan.admin;

          return (
            <div
              key={memberId}
              style={{
                padding: '20px',
                backgroundColor: isCurrentUser ? '#e3f2fd' : 'white',
                borderRadius: '8px',
                border: `2px solid ${isCurrentUser ? '#2196F3' : '#ddd'}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '18px' }}>
                      {profile?.displayName || profile?.email || 'Unknown User'}
                    </h4>
                    {isCurrentUser && (
                      <span style={{
                        backgroundColor: '#2196F3',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        YOU
                      </span>
                    )}
                    {isAdmin && (
                      <span style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ADMIN
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📧</span>
                      <a
                        href={`mailto:${profile?.email || memberId}`}
                        style={{ color: '#2196F3', textDecoration: 'none' }}
                      >
                        {profile?.email || memberId}
                      </a>
                    </div>

                    {profile?.phoneNumber && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>📱</span>
                        <a
                          href={`tel:${profile.phoneNumber}`}
                          style={{ color: '#2196F3', textDecoration: 'none' }}
                        >
                          {profile.phoneNumber}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#fff3e0',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        💡 Tip: Click email or phone to quickly send a message or make a call!
      </div>
    </div>
  );
}

export default MemberDirectory;
