import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

function CreatePlan({ onPlanCreated }) {
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const planData = {
     name: planName,
      description: description,
      startDate: startDate,
      endDate: endDate,
      createdBy: auth.currentUser.uid,
      createdByEmail: auth.currentUser.email,
      members: [auth.currentUser.uid],
      admin: auth.currentUser.uid,  // NEW - mark creator as admin
      createdAt: serverTimestamp(),
    };

      const docRef = await addDoc(collection(db, 'plans'), planData);
      console.log('Plan created with ID:', docRef.id);
      
      // Reset form
      setPlanName('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      
      if (onPlanCreated) onPlanCreated();
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Error creating plan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#f5f5f5', 
      padding: '20px', 
      borderRadius: '8px',
      marginBottom: '30px'
    }}>
      <h2>Create New Plan</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Plan Name (e.g., 'Summer Vacation 2025')"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create Plan'}
        </button>
      </form>
    </div>
  );
}

export default CreatePlan;