import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { trackCollaboratorInvited } from '../utils/analytics';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const EXPIRATION_OPTIONS = [
  { label: '24 hours', value: 24 * 60 * 60 * 1000 },
  { label: '7 days', value: 7 * 24 * 60 * 60 * 1000 },
  { label: '30 days', value: 30 * 24 * 60 * 60 * 1000 },
  { label: 'Never', value: 0 },
];

const MAX_USES_OPTIONS = [
  { label: 'Unlimited', value: 0 },
  { label: '5 uses', value: 5 },
  { label: '10 uses', value: 10 },
  { label: '25 uses', value: 25 },
];

function InviteSection({ plan }) {
  const [inviteCode, setInviteCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [expiration, setExpiration] = useState(7 * 24 * 60 * 60 * 1000); // 7 days default
  const [maxUses, setMaxUses] = useState(0); // unlimited default
  const [showSettings, setShowSettings] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    if (plan.inviteCode) {
      setInviteCode(plan.inviteCode);
    }
  }, [plan]);

  // Check if invite is expired
  const isExpired = () => {
    if (!plan.inviteExpiresAt) return false;
    const expiresAt = plan.inviteExpiresAt.toDate
      ? plan.inviteExpiresAt.toDate()
      : new Date(plan.inviteExpiresAt);
    return new Date() > expiresAt;
  };

  // Check if invite has reached max uses
  const isMaxedOut = () => {
    if (!plan.inviteMaxUses || plan.inviteMaxUses === 0) return false;
    return (plan.inviteUseCount || 0) >= plan.inviteMaxUses;
  };

  const inviteExpired = isExpired();
  const inviteMaxed = isMaxedOut();
  const inviteInvalid = inviteExpired || inviteMaxed;

  // Time remaining display
  const getTimeRemaining = () => {
    if (!plan.inviteExpiresAt) return 'Never expires';
    const expiresAt = plan.inviteExpiresAt.toDate
      ? plan.inviteExpiresAt.toDate()
      : new Date(plan.inviteExpiresAt);
    const diff = expiresAt - new Date();
    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    if (days > 0) return `Expires in ${days}d ${hours}h`;
    if (hours > 0) return `Expires in ${hours}h`;
    return 'Expires soon';
  };

  const getUsesDisplay = () => {
    if (!plan.inviteMaxUses || plan.inviteMaxUses === 0) return 'Unlimited uses';
    return `${plan.inviteUseCount || 0}/${plan.inviteMaxUses} uses`;
  };

  const generateInviteCode = async () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      const updateData = {
        inviteCode: code,
        inviteCreatedAt: new Date(),
        inviteCreatedBy: auth.currentUser.uid,
        inviteUseCount: 0,
      };

      // Set expiration
      if (expiration > 0) {
        updateData.inviteExpiresAt = new Date(Date.now() + expiration);
      } else {
        updateData.inviteExpiresAt = null;
      }

      // Set max uses
      updateData.inviteMaxUses = maxUses;

      await updateDoc(doc(db, 'plans', plan.id), updateData);

      setInviteCode(code);
      trackCollaboratorInvited(plan.id, expiration, maxUses);
      toast.success('Invite code generated!');
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast.error('Error generating invite code');
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(inviteLink).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const isAdmin = plan.admin === auth.currentUser.uid;

  // Non-admin view
  if (!isAdmin) {
    if (!inviteCode || inviteInvalid) return null;

    return (
      <div style={{
        backgroundColor: `${colors.primary}10`,
        padding: '20px',
        borderRadius: '12px',
        border: `1px solid ${colors.primary}30`,
      }}>
        <h3 style={{ marginTop: 0, color: colors.text }}>Invite Link</h3>
        <p style={{ color: colors.textSecondary, fontSize: '14px' }}>Share this link to invite others:</p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <code style={{
            flex: 1,
            padding: '10px 14px',
            backgroundColor: colors.inputBg,
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            color: colors.text,
            fontSize: '13px',
            wordBreak: 'break-all',
          }}>
            {window.location.origin}/join/{inviteCode}
          </code>
          <button
            onClick={copyInviteLink}
            style={{
              padding: '10px 20px',
              backgroundColor: copied ? colors.success : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    );
  }

  // Admin view
  return (
    <div style={{
      backgroundColor: `${colors.primary}10`,
      padding: '24px',
      borderRadius: '12px',
      border: `1px solid ${colors.primary}30`,
    }}>
      <h3 style={{ marginTop: 0, color: colors.text }}>Invite Members</h3>

      {!inviteCode || inviteInvalid ? (
        <div>
          <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '16px' }}>
            {inviteExpired
              ? 'Your previous invite has expired. Generate a new one.'
              : inviteMaxed
                ? 'Your previous invite has reached its usage limit. Generate a new one.'
                : 'Generate an invite link to share with others.'}
          </p>

          {/* Settings */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: colors.text,
                marginBottom: '6px',
              }}>
                Expiration
              </label>
              <select
                value={expiration}
                onChange={(e) => setExpiration(Number(e.target.value))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {EXPIRATION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: colors.text,
                marginBottom: '6px',
              }}>
                Max Uses
              </label>
              <select
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {MAX_USES_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={generateInviteCode}
            style={{
              padding: '12px 24px',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '15px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Generate Invite Link
          </button>
        </div>
      ) : (
        <div>
          {/* Status badges */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}>
            <span style={{
              padding: '4px 12px',
              backgroundColor: colors.successLight,
              color: colors.success,
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              Active
            </span>
            <span style={{
              padding: '4px 12px',
              backgroundColor: colors.backgroundTertiary,
              color: colors.textMuted,
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
            }}>
              {getTimeRemaining()}
            </span>
            <span style={{
              padding: '4px 12px',
              backgroundColor: colors.backgroundTertiary,
              color: colors.textMuted,
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
            }}>
              {getUsesDisplay()}
            </span>
          </div>

          {/* Invite Link */}
          <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '12px' }}>
            Share this link or QR code to invite others:
          </p>
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <code style={{
              flex: 1,
              padding: '10px 14px',
              backgroundColor: colors.inputBg,
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              color: colors.text,
              fontSize: '13px',
              wordBreak: 'break-all',
            }}>
              {window.location.origin}/join/{inviteCode}
            </code>
            <button
              onClick={copyInviteLink}
              style={{
                padding: '10px 20px',
                backgroundColor: copied ? colors.success : colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                whiteSpace: 'nowrap',
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowQR(!showQR)}
              style={{
                padding: '8px 16px',
                backgroundColor: colors.deepPurple,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              {showQR ? 'Hide QR' : 'Show QR'}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                padding: '8px 16px',
                backgroundColor: colors.backgroundTertiary,
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              Settings
            </button>

            <button
              onClick={generateInviteCode}
              style={{
                padding: '8px 16px',
                backgroundColor: colors.warning,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              Regenerate
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: colors.cardBg,
              borderRadius: '10px',
              border: `1px solid ${colors.border}`,
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: colors.text, fontSize: '14px' }}>
                Invite Settings
              </h4>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: colors.textMuted,
                    marginBottom: '4px',
                  }}>
                    Expiration
                  </label>
                  <select
                    value={expiration}
                    onChange={(e) => setExpiration(Number(e.target.value))}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      fontSize: '13px',
                    }}
                  >
                    {EXPIRATION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: colors.textMuted,
                    marginBottom: '4px',
                  }}>
                    Max Uses
                  </label>
                  <select
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      fontSize: '13px',
                    }}
                  >
                    {MAX_USES_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p style={{ color: colors.textMuted, fontSize: '12px', marginTop: '8px', marginBottom: 0 }}>
                Changes apply when you regenerate the invite code.
              </p>
            </div>
          )}

          {/* QR Code Display */}
          {showQR && (
            <div style={{
              marginTop: '16px',
              padding: '24px',
              backgroundColor: 'white',
              borderRadius: '12px',
              textAlign: 'center',
              border: `1px solid ${colors.border}`,
            }}>
              <QRCodeSVG
                value={`${window.location.origin}/join/${inviteCode}`}
                size={200}
                level="H"
                includeMargin={true}
              />
              <p style={{ marginTop: '12px', color: '#666', fontSize: '14px', marginBottom: 0 }}>
                Scan to join {plan.name}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InviteSection;
