// ========================================
// IMPORTS
// ========================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import MembersList from '../components/Memberslist.jsx';
import InviteSection from '../components/InviteSection.jsx';
import Calendar from '../components/Calendar.jsx';
import DayDetailsModal from '../components/DayDetailsModal.jsx';
import MemberDirectory from '../components/MemberDirectory.jsx';
import { useUserProfiles } from '../hooks/useUserProfile';
import { getUserDisplayName, getUserOwesName } from '../utils/userHelpers';

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
  const [currentView, setCurrentView] = useState('task'); // 'task' or 'activity'
  const [selectedDay, setSelectedDay] = useState(null); // For day details modal
  const [expandedScheduling, setExpandedScheduling] = useState(null); // Which activity's scheduling is expanded
  const [tempSuggestions, setTempSuggestions] = useState({}); // Temp date/time inputs per activity

  // Expense tracking state
  const [expenses, setExpenses] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    description: '',
    amount: '',
    category: 'food',
    paidBy: '',
    splitType: 'even', // 'even', 'custom', 'none'
    splitWith: [], // Array of user IDs
    customSplits: {} // For custom split amounts
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [viewExpenses, setViewExpenses] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('tasks'); // 'invite', 'members', 'calendar', 'tasks', 'expenses'

  // User profiles
  const { profiles } = useUserProfiles(plan?.members || []);

  // Expense prompt state
  const [showExpensePrompt, setShowExpensePrompt] = useState(false);
  const [lastCreatedActivity, setLastCreatedActivity] = useState(null);

  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    fetchPlanAndActivities();
    fetchExpenses();
  }, [planId]);

  // ========================================
  // DATA FETCHING
  // ========================================
  const fetchPlanAndActivities = async () => {
    try {
      // Fetch plan details
      const planDoc = await getDoc(doc(db, 'plans', planId));
      if (planDoc.exists()) {
        const planData = { id: planDoc.id, ...planDoc.data() };

        // Check if current user is a member
        if (!planData.members.includes(auth.currentUser.uid)) {
          alert('You are no longer a member of this plan');
          navigate('/dashboard');
          return;
        }

        setPlan(planData);
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

  const fetchExpenses = async () => {
    try {
      const q = query(collection(db, 'expenses'), where('planId', '==', planId));
      const querySnapshot = await getDocs(q);
      const expensesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
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
        type: currentView, // 'task' or 'activity'
        completed: false,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
        scheduledDate: null, // Admin-approved date
        scheduledTime: null, // Admin-approved time
        dateTimeSuggestions: [] // Array of {userId, userName, date, time, votes: [userId]}
      });

      const activityTitle = newActivity;
      const activityType = currentView;

      setNewActivity('');
      await fetchPlanAndActivities();

      // Show expense prompt
      setLastCreatedActivity({ title: activityTitle, type: activityType });
      setShowExpensePrompt(true);
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
  // DATE/TIME SUGGESTION HANDLERS
  // ========================================
  const handleSuggestDateTime = async (activityId, date, time) => {
    if (!date) {
      alert('Please select a date');
      return;
    }

    try {
      const activity = activities.find(a => a.id === activityId);
      const currentUserProfile = profiles[auth.currentUser.uid];
      const displayName = currentUserProfile?.displayName || auth.currentUser.email;

      const newSuggestion = {
        userId: auth.currentUser.uid,
        userName: displayName,
        date: date,
        time: time || '',
        votes: [auth.currentUser.uid], // Auto-vote for own suggestion
        createdAt: new Date()
      };

      const updatedSuggestions = [...(activity.dateTimeSuggestions || []), newSuggestion];

      await updateDoc(doc(db, 'activities', activityId), {
        dateTimeSuggestions: updatedSuggestions
      });

      alert('Date/time suggestion added!');
      fetchPlanAndActivities();
    } catch (error) {
      console.error('Error suggesting date/time:', error);
      alert('Error adding suggestion: ' + error.message);
    }
  };

  const handleVoteSuggestion = async (activityId, suggestionIndex) => {
    try {
      const activity = activities.find(a => a.id === activityId);
      const suggestions = [...(activity.dateTimeSuggestions || [])];
      const suggestion = suggestions[suggestionIndex];

      // Toggle vote
      if (suggestion.votes.includes(auth.currentUser.uid)) {
        suggestion.votes = suggestion.votes.filter(uid => uid !== auth.currentUser.uid);
      } else {
        suggestion.votes.push(auth.currentUser.uid);
      }

      await updateDoc(doc(db, 'activities', activityId), {
        dateTimeSuggestions: suggestions
      });

      fetchPlanAndActivities();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleApproveSuggestion = async (activityId, suggestionIndex) => {
    if (!window.confirm('Schedule this activity with the selected date/time?')) return;

    try {
      const activity = activities.find(a => a.id === activityId);
      const suggestion = activity.dateTimeSuggestions[suggestionIndex];

      await updateDoc(doc(db, 'activities', activityId), {
        scheduledDate: suggestion.date,
        scheduledTime: suggestion.time
      });

      alert('Activity scheduled!');
      fetchPlanAndActivities();
    } catch (error) {
      console.error('Error approving suggestion:', error);
      alert('Error scheduling: ' + error.message);
    }
  };

  const handleUnschedule = async (activityId) => {
    if (!window.confirm('Remove this activity from the schedule?')) return;

    try {
      await updateDoc(doc(db, 'activities', activityId), {
        scheduledDate: null,
        scheduledTime: null
      });

      fetchPlanAndActivities();
    } catch (error) {
      console.error('Error unscheduling:', error);
    }
  };

  // ========================================
  // EXPENSE HANDLERS
  // ========================================
  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!expenseFormData.description.trim() || !expenseFormData.amount || !expenseFormData.paidBy) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const expenseData = {
        planId: planId,
        description: expenseFormData.description,
        amount: parseFloat(expenseFormData.amount),
        category: expenseFormData.category,
        paidBy: expenseFormData.paidBy,
        splitType: expenseFormData.splitType,
        splitWith: expenseFormData.splitType === 'none' ? [] :
                   (expenseFormData.splitType === 'even' ? plan.members : expenseFormData.splitWith),
        customSplits: expenseFormData.customSplits,
        createdBy: auth.currentUser.uid,
        createdAt: new Date()
      };

      if (editingExpenseId) {
        await updateDoc(doc(db, 'expenses', editingExpenseId), expenseData);
        alert('Expense updated!');
      } else {
        await addDoc(collection(db, 'expenses'), expenseData);
        alert('Expense added!');
      }

      // Reset form
      setExpenseFormData({
        description: '',
        amount: '',
        category: 'food',
        paidBy: '',
        splitType: 'even',
        splitWith: [],
        customSplits: {}
      });
      setShowExpenseForm(false);
      setEditingExpenseId(null);
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error saving expense: ' + error.message);
    }
  };

  const handleEditExpense = (expense) => {
    setExpenseFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      paidBy: expense.paidBy,
      splitType: expense.splitType,
      splitWith: expense.splitWith || [],
      customSplits: expense.customSplits || {}
    });
    setEditingExpenseId(expense.id);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;

    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
      alert('Expense deleted!');
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense: ' + error.message);
    }
  };

  const calculateSettlements = () => {
    // Calculate who owes whom
    const balances = {};

    // Initialize balances for all members
    plan.members.forEach(memberId => {
      balances[memberId] = 0;
    });

    // Calculate balances
    expenses.forEach(expense => {
      if (expense.splitType === 'none') {
        // Personal expense, no split
        return;
      }

      const totalAmount = expense.amount;
      const payer = expense.paidBy;
      const splitWithCount = expense.splitWith.length;

      if (expense.splitType === 'even') {
        const sharePerPerson = totalAmount / splitWithCount;

        expense.splitWith.forEach(memberId => {
          if (memberId === payer) {
            balances[payer] += totalAmount - sharePerPerson;
          } else {
            balances[memberId] -= sharePerPerson;
          }
        });
      } else if (expense.splitType === 'custom') {
        let totalShares = 0;
        Object.values(expense.customSplits).forEach(share => {
          totalShares += parseFloat(share || 0);
        });

        Object.entries(expense.customSplits).forEach(([memberId, share]) => {
          const amount = parseFloat(share || 0);
          if (memberId === payer) {
            balances[payer] += totalAmount - amount;
          } else {
            balances[memberId] -= amount;
          }
        });
      }
    });

    // Simplify settlements (minimize transactions)
    const settlements = [];
    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([userId, balance]) => {
      if (balance < -0.01) {
        debtors.push({ userId, amount: -balance });
      } else if (balance > 0.01) {
        creditors.push({ userId, amount: balance });
      }
    });

    // Match debtors with creditors
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: amount
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return settlements;
  };

  const getMemberEmail = (userId) => {
    // This is a simplified version - you might want to fetch user emails from a users collection
    return userId === auth.currentUser.uid ? 'You' : userId;
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

  const handleLeavePlan = async () => {
    if (!window.confirm(`Are you sure you want to leave "${plan.name}"? You'll need a new invite to rejoin.`)) {
      return;
    }

    try {
      // Remove current user from members array
      await updateDoc(doc(db, 'plans', planId), {
        members: arrayRemove(auth.currentUser.uid)
      });

      alert('You have left the plan successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error leaving plan:', error);
      alert('Error leaving plan: ' + error.message);
    }
  };

  // ========================================
  // FILTER ACTIVITIES BY TYPE
  // ========================================
  const filteredActivities = activities.filter(activity => {
    // For backward compatibility: if no type field, default to 'task'
    const activityType = activity.type || 'task';
    return activityType === currentView;
  });

  const taskCount = activities.filter(a => (a.type || 'task') === 'task').length;
  const activityCount = activities.filter(a => a.type === 'activity').length;

  // ========================================
  // LOADING & ERROR STATES
  // ========================================
  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;
  if (!plan) return <div style={{ padding: '40px' }}>Plan not found</div>;

  // ========================================
  // RENDER
  // ========================================
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1000px',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
      
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

        <div style={{ display: 'flex', gap: '10px' }}>
          {plan.admin === auth.currentUser.uid ? (
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
          ) : (
            <button
              onClick={handleLeavePlan}
              style={{
                padding: '8px 16px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🚪 Leave Plan
            </button>
          )}
        </div>
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

      {/* ========================================
          TAB NAVIGATION
          ======================================== */}
      <div style={{
        display: 'flex',
        gap: '0',
        marginTop: '30px',
        marginBottom: '30px',
        borderBottom: '3px solid #e0e0e0',
        overflowX: 'auto'
      }}>
        {[
          { id: 'invite', label: '🔗 Invite', icon: '🔗' },
          { id: 'members', label: '👥 Directory', icon: '👥' },
          { id: 'calendar', label: '📅 Calendar', icon: '📅' },
          { id: 'tasks', label: '📋 Tasks & Activities', icon: '📋' },
          { id: 'expenses', label: '💰 Expenses', icon: '💰' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '15px 25px',
              backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? '#2196F3' : '#666',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #2196F3' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              fontSize: '16px',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              marginBottom: '-3px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================
          INVITE TAB
          ======================================== */}
      {activeTab === 'invite' && (
        <div>
          <InviteSection plan={plan} />
        </div>
      )}

      {/* ========================================
          MEMBERS TAB
          ======================================== */}
      {activeTab === 'members' && (
        <div>
          <MemberDirectory plan={plan} />
          <div style={{ marginTop: '40px' }}>
            <h3>Manage Members</h3>
            <MembersList plan={plan} onMemberRemoved={fetchPlanAndActivities} />
          </div>
        </div>
      )}

      {/* ========================================
          CALENDAR TAB
          ======================================== */}
      {activeTab === 'calendar' && (
        <div>

          <Calendar
            plan={plan}
            activities={activities}
            onDayClick={(date) => setSelectedDay(date)}
          />
        </div>
      )}

      {/* ========================================
          TASKS & ACTIVITIES TAB
          ======================================== */}
      {activeTab === 'tasks' && (
        <div>

      {/* ========================================
          DAY DETAILS MODAL
          ======================================== */}
      {selectedDay && (
        <DayDetailsModal
          date={selectedDay}
          activities={activities}
          onClose={() => setSelectedDay(null)}
          isAdmin={plan.admin === auth.currentUser.uid}
          onUnschedule={handleUnschedule}
        />
      )}

      {/* ========================================
          TASK TYPE TOGGLE
          ======================================== */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginTop: '30px',
        marginBottom: '20px',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '0'
      }}>
        <button
          onClick={() => setCurrentView('task')}
          style={{
            padding: '12px 24px',
            backgroundColor: currentView === 'task' ? '#2196F3' : 'transparent',
            color: currentView === 'task' ? 'white' : '#666',
            border: 'none',
            borderBottom: currentView === 'task' ? '3px solid #2196F3' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            transition: 'all 0.2s'
          }}
        >
          ✓ Simple Tasks ({taskCount})
        </button>
        <button
          onClick={() => setCurrentView('activity')}
          style={{
            padding: '12px 24px',
            backgroundColor: currentView === 'activity' ? '#FF9800' : 'transparent',
            color: currentView === 'activity' ? 'white' : '#666',
            border: 'none',
            borderBottom: currentView === 'activity' ? '3px solid #FF9800' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            transition: 'all 0.2s'
          }}
        >
          🎯 Activities ({activityCount})
        </button>
      </div>

      {/* ========================================
          ADD TASK FORM
          ======================================== */}
      <div style={{
        backgroundColor: currentView === 'task' ? '#e3f2fd' : '#fff3e0',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2>
          {currentView === 'task' ? '✓ Add Simple Task' : '🎯 Add Activity'}
        </h2>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
          {currentView === 'task'
            ? 'Quick to-do items (e.g., "Pack sunscreen", "Download offline maps")'
            : 'Planned activities for your trip (e.g., "Visit Eiffel Tower", "Dinner at Italian restaurant")'}
        </p>
        <form onSubmit={handleAddActivity} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder={currentView === 'task' ? 'New task...' : 'New activity...'}
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            style={{ flex: 1, padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: currentView === 'task' ? '#2196F3' : '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Add
          </button>
        </form>
      </div>

      {/* ========================================
          TASKS LIST
          ======================================== */}
      <h2>
        {currentView === 'task' ? '✓ Simple Tasks' : '🎯 Activities'} ({filteredActivities.length})
      </h2>
      {filteredActivities.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
          No {currentView === 'task' ? 'tasks' : 'activities'} yet. Add your first {currentView} above!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredActivities.map(activity => {
            const activityType = activity.type || 'task';
            const isTask = activityType === 'task';
            const isScheduled = activity.scheduledDate;
            const suggestions = activity.dateTimeSuggestions || [];
            const isExpanded = expandedScheduling === activity.id;

            return (
            <div
              key={activity.id}
              style={{
                padding: '15px',
                backgroundColor: 'white',
                border: `2px solid ${isTask ? '#2196F3' : '#FF9800'}`,
                borderLeft: `6px solid ${isTask ? '#2196F3' : '#FF9800'}`,
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
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

            {/* ========================================
                SCHEDULING SECTION
                ======================================== */}
            <div style={{ marginTop: '15px', borderTop: '1px solid #e0e0e0', paddingTop: '15px' }}>
              {/* Scheduled badge */}
              {isScheduled && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: '#e8f5e9',
                  borderRadius: '5px',
                  border: '1px solid #4CAF50'
                }}>
                  <span style={{ fontSize: '20px' }}>📅</span>
                  <div style={{ flex: 1 }}>
                    <strong>Scheduled:</strong> {activity.scheduledDate}
                    {activity.scheduledTime && ` at ${activity.scheduledTime}`}
                  </div>
                  {plan.admin === auth.currentUser.uid && (
                    <button
                      onClick={() => handleUnschedule(activity.id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Unschedule
                    </button>
                  )}
                </div>
              )}

              {/* Schedule/Suggestions toggle button */}
              <button
                onClick={() => setExpandedScheduling(isExpanded ? null : activity.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isExpanded ? '#9C27B0' : '#E1BEE7',
                  color: isExpanded ? 'white' : '#6A1B9A',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: '100%',
                  fontSize: '14px'
                }}
              >
                {isExpanded ? '▼' : '▶'} Date/Time Suggestions ({suggestions.length})
              </button>

              {/* Expanded scheduling UI */}
              {isExpanded && (
                <div style={{
                  marginTop: '15px',
                  padding: '15px',
                  backgroundColor: '#f3e5f5',
                  borderRadius: '8px'
                }}>
                  {/* Add suggestion form */}
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Suggest Date & Time</h4>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                          Date *
                        </label>
                        <input
                          type="date"
                          value={tempSuggestions[activity.id]?.date || ''}
                          onChange={(e) => setTempSuggestions({
                            ...tempSuggestions,
                            [activity.id]: { ...tempSuggestions[activity.id], date: e.target.value }
                          })}
                          min={plan.startDate}
                          max={plan.endDate}
                          style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '14px',
                            border: '1px solid #ddd',
                            borderRadius: '5px'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                          Time (optional)
                        </label>
                        <input
                          type="time"
                          value={tempSuggestions[activity.id]?.time || ''}
                          onChange={(e) => setTempSuggestions({
                            ...tempSuggestions,
                            [activity.id]: { ...tempSuggestions[activity.id], time: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '14px',
                            border: '1px solid #ddd',
                            borderRadius: '5px'
                          }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const temp = tempSuggestions[activity.id];
                          if (temp?.date) {
                            handleSuggestDateTime(activity.id, temp.date, temp.time || '');
                            setTempSuggestions({
                              ...tempSuggestions,
                              [activity.id]: { date: '', time: '' }
                            });
                          } else {
                            alert('Please select a date');
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#9C27B0',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Add Suggestion
                      </button>
                    </div>
                  </div>

                  {/* List of suggestions */}
                  {suggestions.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center', margin: '20px 0' }}>
                      No suggestions yet. Be the first to suggest a date/time!
                    </p>
                  ) : (
                    <div>
                      <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Suggestions & Votes</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {suggestions.map((suggestion, index) => {
                          const hasVoted = suggestion.votes?.includes(auth.currentUser.uid);
                          const voteCount = suggestion.votes?.length || 0;

                          return (
                            <div
                              key={index}
                              style={{
                                padding: '12px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px'
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                  📅 {suggestion.date}
                                  {suggestion.time && ` ⏰ ${suggestion.time}`}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  Suggested by: {getUserDisplayName(suggestion.userId, profiles, auth.currentUser.uid)}
                                </div>
                              </div>

                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}>
                                {/* Vote button */}
                                <button
                                  onClick={() => handleVoteSuggestion(activity.id, index)}
                                  style={{
                                    padding: '8px 12px',
                                    backgroundColor: hasVoted ? '#4CAF50' : '#e0e0e0',
                                    color: hasVoted ? 'white' : '#333',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                >
                                  {hasVoted ? '✓' : '+'} {voteCount}
                                </button>

                                {/* Admin approve button */}
                                {plan.admin === auth.currentUser.uid && (
                                  <button
                                    onClick={() => handleApproveSuggestion(activity.id, index)}
                                    style={{
                                      padding: '8px 12px',
                                      backgroundColor: '#2196F3',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '5px',
                                      cursor: 'pointer',
                                      fontWeight: 'bold',
                                      fontSize: '12px'
                                    }}
                                  >
                                    ✓ Approve & Schedule
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
            );
          })}
        </div>
      )}

        </div>
      )}

      {/* ========================================
          EXPENSES TAB
          ======================================== */}
      {activeTab === 'expenses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>💰 Expense Tracking</h2>
            <button
              onClick={() => setViewExpenses(!viewExpenses)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {viewExpenses ? 'Hide' : 'Show'} Expenses ({expenses.length})
          </button>
        </div>

        {viewExpenses && (
          <>
            {/* Add Expense Button */}
            <button
              onClick={() => {
                setShowExpenseForm(!showExpenseForm);
                setEditingExpenseId(null);
                setExpenseFormData({
                  description: '',
                  amount: '',
                  category: 'food',
                  paidBy: auth.currentUser.uid,
                  splitType: 'even',
                  splitWith: [],
                  customSplits: {}
                });
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                marginBottom: '20px',
                width: '100%'
              }}
            >
              {showExpenseForm ? '✕ Cancel' : '+ Add Expense'}
            </button>

            {/* Add/Edit Expense Form */}
            {showExpenseForm && (
              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '8px',
                marginBottom: '25px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ marginTop: 0 }}>{editingExpenseId ? 'Edit' : 'Add'} Expense</h3>
                <form onSubmit={handleAddExpense}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Description *
                    </label>
                    <input
                      type="text"
                      value={expenseFormData.description}
                      onChange={(e) => setExpenseFormData({...expenseFormData, description: e.target.value})}
                      placeholder="e.g., Dinner at restaurant, Hotel booking"
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '5px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Amount ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={expenseFormData.amount}
                        onChange={(e) => setExpenseFormData({...expenseFormData, amount: e.target.value})}
                        placeholder="0.00"
                        required
                        style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: '14px',
                          border: '1px solid #ddd',
                          borderRadius: '5px'
                        }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Category
                      </label>
                      <select
                        value={expenseFormData.category}
                        onChange={(e) => setExpenseFormData({...expenseFormData, category: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: '14px',
                          border: '1px solid #ddd',
                          borderRadius: '5px'
                        }}
                      >
                        <option value="food">🍔 Food & Dining</option>
                        <option value="lodging">🏨 Lodging</option>
                        <option value="transport">🚗 Transportation</option>
                        <option value="activities">🎯 Activities & Entertainment</option>
                        <option value="shopping">🛍️ Shopping</option>
                        <option value="other">📦 Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Paid By *
                    </label>
                    <select
                      value={expenseFormData.paidBy}
                      onChange={(e) => setExpenseFormData({...expenseFormData, paidBy: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '5px'
                      }}
                    >
                      <option value="">Select who paid</option>
                      {plan.members.map(memberId => (
                        <option key={memberId} value={memberId}>
                          {getUserDisplayName(memberId, profiles, auth.currentUser.uid)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Split Type
                    </label>
                    <select
                      value={expenseFormData.splitType}
                      onChange={(e) => setExpenseFormData({...expenseFormData, splitType: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '5px'
                      }}
                    >
                      <option value="even">Split Evenly (All Members)</option>
                      <option value="custom">Custom Split</option>
                      <option value="none">Personal Expense (No Split)</option>
                    </select>
                  </div>

                  {expenseFormData.splitType === 'custom' && (
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '5px',
                      marginBottom: '15px'
                    }}>
                      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                        Custom Splits (enter amounts per person)
                      </label>
                      {plan.members.map(memberId => (
                        <div key={memberId} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label style={{ flex: 1 }}>
                            {getUserDisplayName(memberId, profiles, auth.currentUser.uid)}
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={expenseFormData.customSplits[memberId] || ''}
                            onChange={(e) => setExpenseFormData({
                              ...expenseFormData,
                              customSplits: {...expenseFormData.customSplits, [memberId]: e.target.value}
                            })}
                            placeholder="0.00"
                            style={{
                              width: '120px',
                              padding: '8px',
                              fontSize: '14px',
                              border: '1px solid #ddd',
                              borderRadius: '5px'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}
                    >
                      {editingExpenseId ? 'Update' : 'Add'} Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowExpenseForm(false);
                        setEditingExpenseId(null);
                      }}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#999',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Expense List */}
            <div style={{ marginBottom: '30px' }}>
              <h3>All Expenses</h3>
              {expenses.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                  No expenses yet. Add your first expense above!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {expenses.map(expense => {
                    const categoryIcons = {
                      food: '🍔',
                      lodging: '🏨',
                      transport: '🚗',
                      activities: '🎯',
                      shopping: '🛍️',
                      other: '📦'
                    };

                    return (
                      <div
                        key={expense.id}
                        style={{
                          padding: '20px',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                              <span style={{ fontSize: '24px' }}>{categoryIcons[expense.category]}</span>
                              <h4 style={{ margin: 0 }}>{expense.description}</h4>
                            </div>
                            <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
                              <strong style={{ fontSize: '20px', color: '#4CAF50' }}>
                                ${expense.amount.toFixed(2)}
                              </strong>
                              {' • '}
                              Paid by: {getUserDisplayName(expense.paidBy, profiles, auth.currentUser.uid)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#888' }}>
                              Split: {expense.splitType === 'even' ? 'Evenly among all' :
                                      expense.splitType === 'custom' ? 'Custom split' :
                                      'Personal expense'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => handleEditExpense(expense)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Settlement Summary */}
            {expenses.length > 0 && (
              <div style={{
                backgroundColor: '#fff3e0',
                padding: '25px',
                borderRadius: '8px',
                border: '2px solid #FF9800'
              }}>
                <h3 style={{ marginTop: 0 }}>💸 Who Owes Whom</h3>
                {(() => {
                  const settlements = calculateSettlements();

                  if (settlements.length === 0) {
                    return <p style={{ color: '#666' }}>All settled up! No one owes anyone.</p>;
                  }

                  // Calculate total expenses
                  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

                  return (
                    <>
                      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '5px' }}>
                        <strong>Total Trip Expenses: ${totalExpenses.toFixed(2)}</strong>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {settlements.map((settlement, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '15px',
                              backgroundColor: 'white',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '15px',
                              border: '1px solid #ddd'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <strong>{getUserDisplayName(settlement.from, profiles, auth.currentUser.uid)}</strong>
                              {' '}owes{' '}
                              <strong>{getUserOwesName(settlement.to, profiles, auth.currentUser.uid)}</strong>
                            </div>
                            <div style={{
                              padding: '8px 16px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              borderRadius: '20px',
                              fontWeight: 'bold',
                              fontSize: '16px'
                            }}>
                              ${settlement.amount.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: 'white',
                        borderRadius: '5px',
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        💡 Tip: These settlements are optimized to minimize the number of transactions needed.
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </>
        )}
        </div>
      )}

      {/* ========================================
          DAY DETAILS MODAL
          ======================================== */}
      {selectedDay && (
        <DayDetailsModal
          date={selectedDay}
          activities={activities}
          onClose={() => setSelectedDay(null)}
          isAdmin={plan.admin === auth.currentUser.uid}
          onUnschedule={handleUnschedule}
        />
      )}

      {/* ========================================
          EXPENSE PROMPT MODAL
          ======================================== */}
      {showExpensePrompt && lastCreatedActivity && (
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
        }}
        onClick={() => setShowExpensePrompt(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>💰 Add Expense?</h3>
            <p style={{ color: '#666', marginBottom: '25px' }}>
              Were there any expenses for "{lastCreatedActivity.title}"?
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowExpensePrompt(false);
                  setActiveTab('expenses');
                  setShowExpenseForm(true);
                  setExpenseFormData({
                    description: lastCreatedActivity.title,
                    amount: '',
                    category: lastCreatedActivity.type === 'activity' ? 'activities' : 'other',
                    paidBy: auth.currentUser.uid,
                    splitType: 'even',
                    splitWith: [],
                    customSplits: {}
                  });
                }}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Yes, Add Expense
              </button>
              <button
                onClick={() => setShowExpensePrompt(false)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: '#999',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                No, Skip
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

export default PlanDetails;