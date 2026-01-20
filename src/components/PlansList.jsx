import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

function PlansList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const q = query(
        collection(db, 'plans'),
        where('members', 'array-contains', auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const plansData = await Promise.all(
        querySnapshot.docs.map(async (planDoc) => {
          const planId = planDoc.id;
          
          // Fetch activities for this plan
          const activitiesQuery = query(
            collection(db, 'activities'),
            where('planId', '==', planId)
          );
          const activitiesSnapshot = await getDocs(activitiesQuery);
          
          const totalTasks = activitiesSnapshot.size;
          const completedTasks = activitiesSnapshot.docs.filter(
            doc => doc.data().completed
          ).length;
          
          return {
            id: planId,
            ...planDoc.data(),
            totalTasks,
            completedTasks
          };
        })
      );
      
      setPlans(plansData);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading plans...</div>;
  }

  if (plans.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
      No plans yet. Create your first plan above!
    </div>;
  }

  return (
    <div>
      <h2>Your Plans</h2>
      <div style={{ display: 'grid', gap: '15px' }}>
        {plans.map(plan => (
          <div 
            key={plan.id}
            onClick={() => navigate(`/plan/${plan.id}`)}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <h3 style={{ marginTop: 0 }}>{plan.name}</h3>
            {plan.description && <p style={{ color: '#666' }}>{plan.description}</p>}
            <div style={{ fontSize: '14px', color: '#888' }}>
              <div>📅 {plan.startDate} to {plan.endDate}</div>
              <div>👥 {plan.members?.length || 1} member(s)</div>
              <div style={{ 
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}>
                ✓ {plan.completedTasks || 0}/{plan.totalTasks || 0} tasks complete
              </div>
              <div style={{ marginTop: '5px' }}>Created by: {plan.createdByEmail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlansList;