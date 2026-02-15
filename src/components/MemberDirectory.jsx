import { useUserProfiles } from '../hooks/useUserProfile';
import { auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';

function MemberDirectory({ plan }) {
  const { profiles, loading } = useUserProfiles(plan.members);
  const { colors } = useTheme();

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: colors.textMuted }}>Loading members...</div>;
  }

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: '20px', color: colors.text }}>Trip Directory</h3>
      <p style={{ color: colors.textSecondary, marginBottom: '20px', fontSize: '14px' }}>
        Quick access to contact information for all trip members
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {plan.members.map(memberId => {
          const profile = profiles[memberId];
          const isCurrentUser = memberId === auth.currentUser.uid;
          const isAdmin = memberId === plan.admin;
          const avatarColor = profile?.avatarColor || colors.primary;

          return (
            <div
              key={memberId}
              style={{
                padding: '20px',
                backgroundColor: isCurrentUser ? `${colors.primary}10` : colors.cardBg,
                borderRadius: '12px',
                border: `2px solid ${isCurrentUser ? colors.primary : colors.border}`,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isCurrentUser) e.currentTarget.style.borderColor = colors.primary + '60';
              }}
              onMouseLeave={(e) => {
                if (!isCurrentUser) e.currentTarget.style.borderColor = colors.border;
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: avatarColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}>
                  {(profile?.displayName || profile?.email || '?').charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', color: colors.text }}>
                      {profile?.displayName || profile?.email || 'Unknown User'}
                    </h4>
                    {isCurrentUser && (
                      <span style={{
                        backgroundColor: colors.primary,
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        YOU
                      </span>
                    )}
                    {isAdmin && (
                      <span style={{
                        backgroundColor: colors.success,
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        ADMIN
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>📧</span>
                      <a
                        href={`mailto:${profile?.email || memberId}`}
                        style={{ color: colors.primary, textDecoration: 'none', fontSize: '14px' }}
                      >
                        {profile?.email || memberId}
                      </a>
                    </div>

                    {profile?.phoneNumber && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>📱</span>
                        <a
                          href={`tel:${profile.phoneNumber}`}
                          style={{ color: colors.primary, textDecoration: 'none', fontSize: '14px' }}
                        >
                          {profile.phoneNumber}
                        </a>
                      </div>
                    )}

                    {profile?.bio && (
                      <div style={{
                        marginTop: '4px',
                        color: colors.textSecondary,
                        fontSize: '13px',
                        fontStyle: 'italic',
                      }}>
                        "{profile.bio}"
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
        backgroundColor: colors.warningLight,
        borderRadius: '8px',
        fontSize: '14px',
        color: colors.textSecondary,
      }}>
        Click email or phone to quickly send a message or make a call!
      </div>
    </div>
  );
}

export default MemberDirectory;
