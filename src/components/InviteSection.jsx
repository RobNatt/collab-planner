// ========================================
// IMPORTS
// ========================================
import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { QRCodeSVG } from 'qrcode.react';

// ========================================
// MAIN COMPONENT
// ========================================
function InviteSection({ plan }) {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [inviteCode, setInviteCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    // Load existing invite code if available
    if (plan.inviteCode) {
      setInviteCode(plan.inviteCode);
    }
  }, [plan]);

  // ========================================
  // INVITE CODE GENERATION
  // ========================================
  const generateInviteCode = async () => {
    // Generate random 8-character code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    try {
      // Save to plan document
      await updateDoc(doc(db, 'plans', plan.id), {
        inviteCode: code,
        inviteCreatedAt: new Date(),
        inviteCreatedBy: auth.currentUser.uid
      });
      
      setInviteCode(code);
      alert('Invite code generated!');
    } catch (error) {
      console.error('Error generating invite code:', error);
      alert('Error generating invite code');
    }
  };

  // ========================================
  // COPY TO CLIPBOARD
  // ========================================
  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ========================================
  // ADMIN CHECK
  // ========================================
  const isAdmin = plan.admin === auth.currentUser.uid;

  if (!isAdmin) {
    // Non-admins can see the invite code but not generate new ones
    if (!inviteCode) return null;
    
    return (
      <div style={{
        backgroundColor: '#e3f2fd',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>📨 Invite Link</h3>
        <p style={{ color: '#666' }}>Share this link to invite others:</p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <code style={{
            flex: 1,
            padding: '10px',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            {window.location.origin}/join/{inviteCode}
          </code>
          <button
            onClick={copyInviteLink}
            style={{
              padding: '10px 20px',
              backgroundColor: copied ? '#4CAF50' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER (ADMIN VIEW)
  // ========================================
  return (
    <div style={{
      backgroundColor: '#e3f2fd',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3>📨 Invite Members</h3>
      
      {!inviteCode ? (
        // No invite code yet
        <div>
          <p style={{ color: '#666' }}>Generate an invite link to share with others.</p>
          <button
            onClick={generateInviteCode}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Generate Invite Link
          </button>
        </div>
      ) : (
        // Invite code exists
        <div>
          <p style={{ color: '#666' }}>Share this link or QR code to invite others:</p>
          
          {/* Invite Link */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
            <code style={{
              flex: 1,
              padding: '10px',
              backgroundColor: 'white',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}>
              {window.location.origin}/join/{inviteCode}
            </code>
            <button
              onClick={copyInviteLink}
              style={{
                padding: '10px 20px',
                backgroundColor: copied ? '#4CAF50' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          {/* QR Code Toggle */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowQR(!showQR)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#673AB7',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </button>
            
            <button
              onClick={generateInviteCode}
              style={{
                padding: '8px 16px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Regenerate Code
            </button>
          </div>

          {/* QR Code Display */}
          {showQR && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <QRCodeSVG 
                value={`${window.location.origin}/join/${inviteCode}`}
                size={200}
                level="H"
                includeMargin={true}
              />
              <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
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