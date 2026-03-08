import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const AVATAR_COLORS = [
  '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#f44336',
  '#00BCD4', '#E91E63', '#673AB7', '#3F51B5', '#009688',
];

function UserProfileSetup({ onComplete }) {
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  });
  const [saving, setSaving] = useState(false);
  const { colors } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setSaving(true);

    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        avatarColor: formData.avatarColor,
        email: auth.currentUser.email,
        bio: '',
        favoriteDestinations: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      toast.success('Profile created!');
      onComplete();
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Error creating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.overlay,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div
        className="animate-scaleIn"
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: `0 4px 24px ${colors.shadow}`,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          {/* Avatar Preview */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: formData.avatarColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 auto 16px',
            transition: 'background-color 0.3s ease',
          }}>
            {getInitials(formData.displayName)}
          </div>
          <h2 style={{ marginTop: 0, marginBottom: '8px', color: colors.text }}>
            Welcome to Travel Gang!
          </h2>
          <p style={{ color: colors.textSecondary, margin: 0 }}>
            Let's set up your profile so your trip partners can find you.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar Color */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: colors.text,
              fontSize: '14px',
            }}>
              Pick your color
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {AVATAR_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatarColor: color })}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: formData.avatarColor === color
                      ? `3px solid ${colors.text}`
                      : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: colors.text,
              fontSize: '14px',
            }}>
              Display Name *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="e.g., John Smith"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '10px',
                backgroundColor: colors.inputBg,
                color: colors.text,
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: colors.text,
              fontSize: '14px',
            }}>
              Phone Number (optional)
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="e.g., (555) 123-4567"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '10px',
                backgroundColor: colors.inputBg,
                color: colors.text,
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
            />
            <small style={{ color: colors.textMuted, fontSize: '12px' }}>
              This helps your trip partners contact you
            </small>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: saving ? colors.textMuted : colors.success,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {saving ? (
              <>
                <div style={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Creating Profile...
              </>
            ) : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserProfileSetup;
