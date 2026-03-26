import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, setDoc, deleteDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, auth, functions } from '../config/firebase';
import { billingKindFromLicensePlan } from '../utils/inviteBilling';
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
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actingRequestId, setActingRequestId] = useState('');
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

      if (plan.inviteCode) {
        await deleteDoc(doc(db, 'inviteLinks', plan.inviteCode)).catch(() => {});
      }

      const adminId = plan.admin;
      let hostDisplayName = plan.createdByEmail?.split('@')[0] || 'The organizer';
      let billingKind = 'free';
      try {
        const profSnap = await getDoc(doc(db, 'users', adminId));
        if (profSnap.exists() && profSnap.data().displayName?.trim()) {
          hostDisplayName = profSnap.data().displayName.trim();
        }
      } catch (_) { /* keep fallback name */ }
      try {
        const licSnap = await getDoc(doc(db, 'licenses', adminId));
        const lic = licSnap.data();
        const licensePlan = lic?.plan || (lic?.status === 'active' ? 'ltd' : null);
        billingKind = billingKindFromLicensePlan(licensePlan);
      } catch (_) { /* free */ }

      await updateDoc(doc(db, 'plans', plan.id), updateData);

      try {
        await setDoc(doc(db, 'inviteLinks', code), {
          planId: plan.id,
          planName: plan.name || 'Trip plan',
          hostDisplayName,
          planAdminUid: adminId,
          billingKind,
          inviteExpiresAt: updateData.inviteExpiresAt ?? null,
          inviteMaxUses: maxUses,
          updatedAt: new Date(),
        });
      } catch (linkErr) {
        console.error('inviteLinks write:', linkErr);
      }

      setInviteCode(code);
      trackCollaboratorInvited(plan.id, expiration, maxUses);
      toast.success('Invite code generated!');
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast.error('Error generating invite code');
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/invite/${inviteCode}`;
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

  useEffect(() => {
    if (!isAdmin || !plan?.id) return undefined;
    setLoadingRequests(true);
    const q = query(
      collection(db, 'collaboratorJoinRequests'),
      where('adminUid', '==', auth.currentUser.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((row) => row.planId === plan.id && row.status === 'pending_admin_payment')
        .sort((a, b) => {
          const ta = a.createdAt?.seconds || 0;
          const tb = b.createdAt?.seconds || 0;
          return tb - ta;
        });
      setPendingRequests(rows);
      setLoadingRequests(false);
    }, (err) => {
      console.error('Pending collaborator query error:', err);
      setLoadingRequests(false);
      toast.error('Could not load collaborator requests.');
    });
    return () => unsub();
  }, [isAdmin, plan?.id]);

  const handleApproveAndPay = async (requestId) => {
    setActingRequestId(requestId);
    try {
      const createCheckout = httpsCallable(functions, 'createCollaboratorJoinCheckout');
      const result = await createCheckout({ requestId });
      const url = result?.data?.url;
      if (!url) throw new Error('Stripe checkout URL missing.');
      window.location.href = url;
    } catch (error) {
      console.error('createCollaboratorJoinCheckout:', error);
      toast.error(error.message || 'Could not start collaborator checkout.');
    } finally {
      setActingRequestId('');
    }
  };

  const handleRejectRequest = async (requestId) => {
    setActingRequestId(requestId);
    try {
      const reject = httpsCallable(functions, 'rejectCollaboratorJoinRequest');
      await reject({ requestId });
      toast.success('Collaborator request rejected.');
    } catch (error) {
      console.error('rejectCollaboratorJoinRequest:', error);
      toast.error(error.message || 'Could not reject request.');
    } finally {
      setActingRequestId('');
    }
  };

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
            {window.location.origin}/invite/{inviteCode}
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
              {window.location.origin}/invite/{inviteCode}
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
                value={`${window.location.origin}/invite/${inviteCode}`}
                size={200}
                level="H"
                includeMargin={true}
              />
              <p style={{ marginTop: '12px', color: '#666', fontSize: '14px', marginBottom: 0 }}>
                Scan to join {plan.name}
              </p>
            </div>
          )}

          {/* Pending collaborator payments */}
          <div style={{
            marginTop: '18px',
            padding: '16px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.cardBg,
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: colors.text }}>
              Pending collaborator approvals
            </h4>
            {loadingRequests ? (
              <p style={{ margin: 0, color: colors.textMuted, fontSize: '13px' }}>
                Checking pending requests...
              </p>
            ) : pendingRequests.length === 0 ? (
              <p style={{ margin: 0, color: colors.textMuted, fontSize: '13px' }}>
                No pending collaborator payment approvals.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      gap: '8px',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ minWidth: '180px' }}>
                      <div style={{ color: colors.text, fontSize: '14px', fontWeight: '600' }}>
                        {req.collaboratorName || req.collaboratorEmail || 'Collaborator'}
                      </div>
                      <div style={{ color: colors.textMuted, fontSize: '12px' }}>
                        Requested access. Fee: ${(Number(req.amountCents || 100) / 100).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleApproveAndPay(req.id)}
                        disabled={actingRequestId === req.id}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: colors.success,
                          color: 'white',
                          cursor: actingRequestId === req.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        {actingRequestId === req.id ? 'Opening...' : `Accept payment for ${req.collaboratorName || 'collaborator'}?`}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectRequest(req.id)}
                        disabled={actingRequestId === req.id}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: `1px solid ${colors.border}`,
                          backgroundColor: 'transparent',
                          color: colors.textSecondary,
                          cursor: actingRequestId === req.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InviteSection;
