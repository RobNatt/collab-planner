import { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, FieldValue } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { trackTripCreated } from '../utils/analytics';
import { getPreTripChargeFields } from '../utils/pricingSchedule';
import toast from 'react-hot-toast';

/**
 * Pay-per-trip: confirm trip details and create plan without charging.
 * Usage-based billing runs 48 hours before the trip start (see Cloud Function processPreTripCharges).
 */
export function ConfirmTripModal({ tripData, licenseMeta, onClose, onSuccess }) {
  const { colors } = useTheme();
  const [saving, setSaving] = useState(false);

  const { planName, description, startDate, endDate } = tripData;
  const { planType, isBusiness } = licenseMeta || {};

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const planData = {
        name: planName,
        description: description || '',
        startDate,
        endDate,
        createdBy: auth.currentUser.uid,
        createdByEmail: auth.currentUser.email,
        members: [auth.currentUser.uid],
        admin: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        ...getPreTripChargeFields({ planType, isBusiness, startDate }),
      };

      await addDoc(collection(db, 'plans'), planData);
      try {
        await updateDoc(doc(db, 'userProfiles', auth.currentUser.uid), {
          restrictDashboardToPlanId: FieldValue.delete(),
        });
      } catch { /* no profile doc */ }
      const durationDays = startDate && endDate
        ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
        : 0;
      trackTripCreated(planName, durationDays);

      toast.success('Trip created! Usage-based charges run 48 hours before your trip starts.');
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('Trip confirmation error:', err);
      toast.error(err.message || 'Could not create trip. Please try again.');
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
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        padding: '36px',
        backgroundColor: colors.cardBg,
        borderRadius: '16px',
        boxShadow: `0 8px 32px ${colors.shadow}`,
      }}
      >
        <h2 style={{ color: colors.text, fontSize: '22px', fontWeight: '700', marginBottom: '16px' }}>
          Confirm your trip
        </h2>
        <p style={{ color: colors.textSecondary, marginBottom: '20px', lineHeight: '1.6' }}>
          You are not charged when you create the plan. For Pay Per Trip, we bill the organizer{' '}
          <strong style={{ color: colors.text }}>$2 for the trip plus $1 per collaborator</strong>
          {' '}on the plan — once, about <strong style={{ color: colors.text }}>48 hours before</strong> your trip starts.
          Collaborators can join anytime before that; you only pay for who is on the plan at billing time.
        </p>
        <div style={{
          padding: '16px',
          backgroundColor: colors.backgroundTertiary,
          borderRadius: '10px',
          marginBottom: '24px',
        }}
        >
          <div style={{ color: colors.text, fontWeight: '600', marginBottom: '4px' }}>{planName}</div>
          <div style={{ color: colors.textSecondary, fontSize: '14px' }}>
            {startDate} → {endDate}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: '600',
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            style={{
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: '600',
              backgroundColor: saving ? colors.textMuted : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Create trip'}
          </button>
        </div>
      </div>
    </div>
  );
}
