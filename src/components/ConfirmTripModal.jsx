import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { functions, db, auth } from '../config/firebase';
import { useTheme } from '../contexts/ThemeContext';
import { trackTripCreated } from '../utils/analytics';
import toast from 'react-hot-toast';

/**
 * Modal for pay-per-trip users to confirm trip name and dates before charge.
 * Charges $2 + $1 per collaborator (at creation, just creator so $2).
 */
export function ConfirmTripModal({ tripData, onClose, onSuccess }) {
  const { colors } = useTheme();
  const [charging, setCharging] = useState(false);

  const { planName, description, startDate, endDate } = tripData;
  const collaboratorCount = 0; // At creation, only creator
  const totalCents = (2 + collaboratorCount) * 100;
  const totalDollars = (totalCents / 100).toFixed(2);

  const handleConfirm = async () => {
    setCharging(true);
    try {
      const chargeTripConfirmation = httpsCallable(functions, 'chargeTripConfirmation');
      await chargeTripConfirmation({
        tripName: planName,
        startDate,
        endDate,
        collaboratorCount,
      });

      // Charge succeeded — create the plan
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
      };

      await addDoc(collection(db, 'plans'), planData);
      const durationDays = startDate && endDate
        ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
        : 0;
      trackTripCreated(planName, durationDays);

      toast.success('Trip created! We charged your card $2.');
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('Trip confirmation error:', err);
      const msg = err.message || err.code || 'Charge failed';
      toast.error(msg.includes('payment method') ? 'Add a payment method in your account settings first.' : 'Charge failed. Please try again.');
    } finally {
      setCharging(false);
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
      <div className="animate-scaleIn" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '36px',
        backgroundColor: colors.cardBg,
        borderRadius: '16px',
        boxShadow: `0 8px 32px ${colors.shadow}`,
      }}>
        <h2 style={{ color: colors.text, fontSize: '22px', fontWeight: '700', marginBottom: '16px' }}>
          Confirm your trip
        </h2>
        <p style={{ color: colors.textSecondary, marginBottom: '20px', lineHeight: '1.6' }}>
          Please confirm the trip details below. Your card will be charged <strong style={{ color: colors.text }}>${totalDollars}</strong> ($2 base + $1 per collaborator when they join).
        </p>
        <div style={{
          padding: '16px',
          backgroundColor: colors.backgroundTertiary,
          borderRadius: '10px',
          marginBottom: '24px',
        }}>
          <div style={{ color: colors.text, fontWeight: '600', marginBottom: '4px' }}>{planName}</div>
          <div style={{ color: colors.textSecondary, fontSize: '14px' }}>
            {startDate} → {endDate}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={charging}
            style={{
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: '600',
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: charging ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={charging}
            style={{
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: '600',
              backgroundColor: charging ? colors.textMuted : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: charging ? 'not-allowed' : 'pointer',
            }}
          >
            {charging ? 'Charging...' : `Confirm & pay $${totalDollars}`}
          </button>
        </div>
      </div>
    </div>
  );
}
