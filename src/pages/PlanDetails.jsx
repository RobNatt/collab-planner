// ========================================
// IMPORTS
// ========================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import MembersList from '../components/Memberslist.jsx';
import InviteSection from '../components/InviteSection.jsx';

// ========================================
// MAIN COMPONENT
// ========================================
function PlanDetails() {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    fetchPlanAndActivities();
  }, [planId]);

  // ========================================
  // DATA FETCHING
  // ========================================
  const fetchPlanAndActivities = async () => {
    try {
      // Fetch plan details
      const planDoc = await getDoc(doc(db, 'plans', planId));
      if (planDoc.exists()) {
        setPlan({ id: planDoc.id, ...planDoc.data() });
      }

      // Fetch activities for this plan
      const q = query(collection(db, 'activities'), where('planId', '==', planId));
      const querySnapshot = await getDocs(q);
      const activitiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // ACTIVITY HANDLERS
  // ========================================
  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.trim()) return;

    try {
      await addDoc(collection(db, 'activities'), {
        planId: planId,
        title: newActivity,
        completed: false,
        createdBy: auth.currentUser.uid,
        createdAt: new Date()
      });
      
      setNewActivity('');
      fetchPlanAndActivities();
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const handleToggleComplete = async (activityId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'activities', activityId), {
        completed: !currentStatus
      });
      fetchPlanAndActivities();
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Delete this task?')) return;
    
    try {
      await deleteDoc(doc(db, 'activities', activityId));
      fetchPlanAndActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  // ========================================
  // EDIT HANDLERS
  // ========================================
  const handleStartEdit = (activity) => {
    setEditingId(activity.id);
    setEditingText(activity.title);
  };

  const handleSaveEdit = async (activityId) => {
    if (!editingText.trim()) return;
    
    try {
      await updateDoc(doc(db, 'activities', activityId), {
        title: editingText
      });
      setEditingId(null);
      setEditingText('');
      fetchPlanAndActivities();
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  // ========================================
  // PLAN MANAGEMENT HANDLERS
  // ========================================
  const handleDeletePlan = async () => {
    if (!window.confirm(`Are you sure you want to delete "${plan.name}"? This will delete all tasks and cannot be undone.`)) {
      return;
    }

    try {
      // Delete all activities first
      const activitiesQuery = query(collection(db, 'activities'), where('planId', '==', planId));
      const activitiesSnapshot = await getDocs(activitiesQuery);
      
      const deletePromises = activitiesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // Delete the plan
      await deleteDoc(doc(db, 'plans', planId));

      // Navigate back to dashboard
      alert('Plan deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Error deleting plan: ' + error.message);
    }
  };

  // ========================================
  // LOADING & ERROR STATES
  // ========================================
  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;
  if (!plan) return <div style={{ padding: '40px' }}>Plan not found</div>;

  // ========================================
  // RENDER
  // ========================================
  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* ========================================
          NAVIGATION BAR
          ======================================== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#ddd',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ← Back to Dashboard
        </button>

        {plan.admin === auth.currentUser.uid && (
          <button
            onClick={handleDeletePlan}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🗑️ Delete Plan
          </button>
        )}
      </div>

      {/* ========================================
          PLAN HEADER
          ======================================== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h1 style={{ margin: 0 }}>{plan.name}</h1>
        {plan.admin === auth.currentUser.uid && (
          <span style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            ADMIN
          </span>
        )}
      </div>
      {plan.description && <p style={{ color: '#666', marginTop: '10px' }}>{plan.description}</p>}
      <p style={{ color: '#888' }}>📅 {plan.startDate} to {plan.endDate}</p>


      <InviteSection plan={plan} />

      {/* ========================================
          MEMBERS LIST
          ======================================== */}
      <MembersList plan={plan} onMemberRemoved={fetchPlanAndActivities} />

      {/* ========================================
          ADD TASK FORM
          ======================================== */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '30px',
        marginBottom: '30px'
      }}>
        <h2>Add Task</h2>
        <form onSubmit={handleAddActivity} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="New task (e.g., 'Book hotel', 'Pack sunscreen')"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            style={{ flex: 1, padding: '10px', fontSize: '16px' }}
          />
          <button 
            type="submit"
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </form>
      </div>

      {/* ========================================
          TASKS LIST
          ======================================== */}
      <h2>Tasks ({activities.length})</h2>
      {activities.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
          No tasks yet. Add your first task above!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activities.map(activity => (
            <div 
              key={activity.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '15px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            >
              <input
                type="checkbox"
                checked={activity.completed}
                onChange={() => handleToggleComplete(activity.id, activity.completed)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                disabled={editingId === activity.id}
              />
              
              {/* EDITING MODE */}
              {editingId === activity.id ? (
                <>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      fontSize: '16px',
                      border: '2px solid #4CAF50',
                      borderRadius: '5px'
                    }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(activity.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <button
                    onClick={() => handleSaveEdit(activity.id)}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#999',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                /* DISPLAY MODE */
                <>
                  <span style={{ 
                    flex: 1,
                    textDecoration: activity.completed ? 'line-through' : 'none',
                    color: activity.completed ? '#999' : '#333'
                  }}>
                    {activity.title}
                  </span>
                  <button
                    onClick={() => handleStartEdit(activity)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlanDetails;