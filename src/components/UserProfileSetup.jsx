import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

function UserProfileSetup({ onComplete }) {
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.displayName.trim()) {
      alert('Please enter your name');
      return;
    }

    setSaving(true);

    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        email: auth.currentUser.email,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      alert('Profile created successfully!');
      onComplete();
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Error creating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Welcome to Collab Planner!</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Let's set up your profile so your trip partners can reach you.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Display Name *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              placeholder="e.g., John Smith"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Phone Number (optional)
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              placeholder="e.g., (555) 123-4567"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              This helps your trip partners contact you
            </small>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: saving ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Creating Profile...' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserProfileSetup;
