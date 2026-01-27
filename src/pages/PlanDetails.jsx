// ========================================
// IMPORTS
// ========================================
import { useState, useEffect, useMemo } from 'react';
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
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { SkeletonText, Skeleton } from '../components/Skeleton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

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
  const [currentView, setCurrentView] = useState('task');
  const [selectedDay, setSelectedDay] = useState(null);
  const [expandedScheduling, setExpandedScheduling] = useState(null);
  const [tempSuggestions, setTempSuggestions] = useState({});
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'priority', 'dueDate', 'completed'
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const { colors } = useTheme();

  // Action-specific loading states
  const [addingTask, setAddingTask] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // For individual item actions

  // Expense tracking state
  const [expenses, setExpenses] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    description: '',
    amount: '',
    category: 'food',
    paidBy: '',
    splitType: 'even',
    splitWith: [],
    customSplits: {}
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [viewExpenses, setViewExpenses] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('tasks');

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
      const planDoc = await getDoc(doc(db, 'plans', planId));
      if (planDoc.exists()) {
        const planData = { id: planDoc.id, ...planDoc.data() };

        if (!planData.members.includes(auth.currentUser.uid)) {
          toast.error('You are no longer a member of this plan');
          navigate('/dashboard');
          return;
        }

        setPlan(planData);
      }

      const q = query(collection(db, 'activities'), where('planId', '==', planId));
      const querySnapshot = await getDocs(q);
      const activitiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load plan data');
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
    if (!newActivity.trim() || addingTask) return;

    setAddingTask(true);
    try {
      await addDoc(collection(db, 'activities'), {
        planId: planId,
        title: newActivity,
        type: currentView,
        completed: false,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
        scheduledDate: null,
        scheduledTime: null,
        dateTimeSuggestions: [],
        priority: newTaskPriority,
        dueDate: newTaskDueDate || null,
        assignedTo: newTaskAssignee || null,
      });

      const activityTitle = newActivity;
      const activityType = currentView;

      setNewActivity('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setNewTaskAssignee('');
      await fetchPlanAndActivities();

      toast.success(`${currentView === 'task' ? 'Task' : 'Activity'} added!`);
      setLastCreatedActivity({ title: activityTitle, type: activityType });
      setShowExpensePrompt(true);
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to add activity');
    } finally {
      setAddingTask(false);
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
      toast.error('Failed to update task');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await deleteDoc(doc(db, 'activities', activityId));
      fetchPlanAndActivities();
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete task');
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
      toast.success('Task updated');
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Failed to update task');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleUpdateTaskProperty = async (activityId, property, value) => {
    try {
      await updateDoc(doc(db, 'activities', activityId), {
        [property]: value
      });
      fetchPlanAndActivities();
      toast.success('Task updated');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  // ========================================
  // DATE/TIME SUGGESTION HANDLERS
  // ========================================
  const handleSuggestDateTime = async (activityId, date, time) => {
    if (!date) {
      toast.error('Please select a date');
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
        votes: [auth.currentUser.uid],
        createdAt: new Date()
      };

      const updatedSuggestions = [...(activity.dateTimeSuggestions || []), newSuggestion];

      await updateDoc(doc(db, 'activities', activityId), {
        dateTimeSuggestions: updatedSuggestions
      });

      toast.success('Suggestion added!');
      fetchPlanAndActivities();
    } catch (error) {
      console.error('Error suggesting date/time:', error);
      toast.error('Error adding suggestion');
    }
  };

  const handleVoteSuggestion = async (activityId, suggestionIndex) => {
    try {
      const activity = activities.find(a => a.id === activityId);
      const suggestions = [...(activity.dateTimeSuggestions || [])];
      const suggestion = suggestions[suggestionIndex];

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
      toast.error('Failed to vote');
    }
  };

  const handleApproveSuggestion = async (activityId, suggestionIndex) => {
    if (!window.confirm('Schedule this activity with the selected date/time?')) return;

    try {
      const activity = activities.find(a => a.id === activityId);
      const suggestion = activity.dateTimeSuggestions[suggestionIndex];

      await updateDoc(doc(db, 'activities', activityId), {
        scheduledDate: suggestion.date,
        scheduledTime: suggestion.time,
        dueDate: suggestion.date // Auto-populate due date with scheduled date
      });

      toast.success('Activity scheduled!');
      fetchPlanAndActivities();
    } catch (error) {
      console.error('Error approving suggestion:', error);
      toast.error('Error scheduling activity');
    }
  };

  const handleUnschedule = async (activityId) => {
    if (!window.confirm('Remove this activity from the schedule?')) return;

    try {
      await updateDoc(doc(db, 'activities', activityId), {
        scheduledDate: null,
        scheduledTime: null
      });

      toast.success('Activity unscheduled');
      fetchPlanAndActivities();
    } catch (error) {
      console.error('Error unscheduling:', error);
      toast.error('Failed to unschedule');
    }
  };

  // ========================================
  // EXPENSE HANDLERS
  // ========================================
  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!expenseFormData.description.trim() || !expenseFormData.amount || !expenseFormData.paidBy) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSavingExpense(true);
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
        toast.success('Expense updated!');
      } else {
        await addDoc(collection(db, 'expenses'), expenseData);
        toast.success('Expense added!');
      }

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
      toast.error('Error saving expense');
    } finally {
      setSavingExpense(false);
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
      toast.success('Expense deleted!');
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Error deleting expense');
    }
  };

  const calculateSettlements = () => {
    const balances = {};
    plan.members.forEach(memberId => {
      balances[memberId] = 0;
    });

    expenses.forEach(expense => {
      if (expense.splitType === 'none') return;

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

  // ========================================
  // PLAN MANAGEMENT HANDLERS
  // ========================================
  const handleDeletePlan = async () => {
    if (!window.confirm(`Are you sure you want to delete "${plan.name}"? This will delete all tasks and cannot be undone.`)) {
      return;
    }

    try {
      const activitiesQuery = query(collection(db, 'activities'), where('planId', '==', planId));
      const activitiesSnapshot = await getDocs(activitiesQuery);

      const deletePromises = activitiesSnapshot.docs.map(doc =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      await deleteDoc(doc(db, 'plans', planId));

      toast.success('Plan deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Error deleting plan');
    }
  };

  const handleLeavePlan = async () => {
    if (!window.confirm(`Are you sure you want to leave "${plan.name}"? You'll need a new invite to rejoin.`)) {
      return;
    }

    try {
      await updateDoc(doc(db, 'plans', planId), {
        members: arrayRemove(auth.currentUser.uid)
      });

      toast.success('You have left the plan');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error leaving plan:', error);
      toast.error('Error leaving plan');
    }
  };

  // ========================================
  // FILTER AND SORT ACTIVITIES
  // ========================================
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const filteredActivities = useMemo(() => {
    let filtered = activities.filter(activity => {
      const activityType = activity.type || 'task';
      return activityType === currentView;
    });

    // Sort based on sortBy
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return (a.createdAt?.toDate?.() || new Date(a.createdAt)) - (b.createdAt?.toDate?.() || new Date(b.createdAt));
        case 'newest':
          return (b.createdAt?.toDate?.() || new Date(b.createdAt)) - (a.createdAt?.toDate?.() || new Date(a.createdAt));
        case 'priority':
          return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'completed':
          return (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
        default:
          return 0;
      }
    });
  }, [activities, currentView, sortBy]);

  const taskCount = activities.filter(a => (a.type || 'task') === 'task').length;
  const activityCount = activities.filter(a => a.type === 'activity').length;

  // Input styles
  const inputStyle = {
    padding: '12px 16px',
    fontSize: '14px',
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '8px',
    color: colors.text,
    transition: 'all 0.2s ease',
    outline: 'none',
  };

  // ========================================
  // LOADING & ERROR STATES
  // ========================================
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
        transition: 'background-color 0.3s ease',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          padding: '40px',
          backgroundColor: colors.cardBg,
          borderRadius: '12px',
          boxShadow: `0 2px 8px ${colors.shadow}`,
        }}>
          <Skeleton width="60%" height="36px" style={{ marginBottom: '16px' }} />
          <SkeletonText lines={2} style={{ marginBottom: '24px' }} />
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} width="120px" height="48px" borderRadius="8px" />
            ))}
          </div>
          <SkeletonText lines={8} />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
      }}>
        <div style={{
          textAlign: 'center',
          color: colors.textSecondary,
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>404</div>
          <h2 style={{ color: colors.text }}>Plan not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '16px',
              padding: '12px 24px',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER
  // ========================================
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      display: 'flex',
      justifyContent: 'center',
      padding: '20px',
      transition: 'background-color 0.3s ease',
    }}>
      <div
        className="animate-fadeIn"
        style={{
          width: '100%',
          maxWidth: '1000px',
          padding: '40px',
          backgroundColor: colors.cardBg,
          borderRadius: '12px',
          boxShadow: `0 2px 8px ${colors.shadow}`,
          transition: 'all 0.3s ease',
        }}
      >

      {/* NAVIGATION BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: colors.backgroundTertiary,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.backgroundTertiary;
          }}
        >
          ← Back to Dashboard
        </button>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <ThemeToggle />
          {plan.admin === auth.currentUser.uid ? (
            <button
              onClick={handleDeletePlan}
              style={{
                padding: '10px 20px',
                backgroundColor: colors.danger,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Delete Plan
            </button>
          ) : (
            <button
              onClick={handleLeavePlan}
              style={{
                padding: '10px 20px',
                backgroundColor: colors.warning,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Leave Plan
            </button>
          )}
        </div>
      </div>

      {/* PLAN HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, color: colors.text }}>{plan.name}</h1>
        {plan.admin === auth.currentUser.uid && (
          <span style={{
            backgroundColor: colors.success,
            color: 'white',
            padding: '6px 14px',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: 'bold',
          }}>
            ADMIN
          </span>
        )}
      </div>
      {plan.description && <p style={{ color: colors.textSecondary, marginTop: '10px' }}>{plan.description}</p>}
      <p style={{ color: colors.textMuted }}>📅 {plan.startDate} to {plan.endDate}</p>

      {/* TAB NAVIGATION */}
      <div style={{
        display: 'flex',
        gap: '0',
        marginTop: '30px',
        marginBottom: '30px',
        borderBottom: `3px solid ${colors.border}`,
        overflowX: 'auto',
      }}>
        {[
          { id: 'invite', label: 'Invite' },
          { id: 'members', label: 'Directory' },
          { id: 'calendar', label: 'Calendar' },
          { id: 'tasks', label: 'Tasks & Activities' },
          { id: 'expenses', label: 'Expenses' },
          { id: 'analytics', label: 'Analytics' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '15px 25px',
              backgroundColor: activeTab === tab.id ? colors.cardBg : 'transparent',
              color: activeTab === tab.id ? colors.primary : colors.textSecondary,
              border: 'none',
              borderBottom: activeTab === tab.id ? `3px solid ${colors.primary}` : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              fontSize: '16px',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              marginBottom: '-3px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* INVITE TAB */}
      {activeTab === 'invite' && (
        <div className="animate-fadeIn">
          <InviteSection plan={plan} />
        </div>
      )}

      {/* MEMBERS TAB */}
      {activeTab === 'members' && (
        <div className="animate-fadeIn">
          <MemberDirectory plan={plan} />
          <div style={{ marginTop: '40px' }}>
            <h3 style={{ color: colors.text }}>Manage Members</h3>
            <MembersList plan={plan} onMemberRemoved={fetchPlanAndActivities} />
          </div>
        </div>
      )}

      {/* CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <div className="animate-fadeIn">
          <Calendar
            plan={plan}
            activities={activities}
            onDayClick={(date) => setSelectedDay(date)}
          />
        </div>
      )}

      {/* TASKS & ACTIVITIES TAB */}
      {activeTab === 'tasks' && (
        <div className="animate-fadeIn">

      {selectedDay && (
        <DayDetailsModal
          date={selectedDay}
          activities={activities}
          onClose={() => setSelectedDay(null)}
          isAdmin={plan.admin === auth.currentUser.uid}
          onUnschedule={handleUnschedule}
        />
      )}

      {/* TASK TYPE TOGGLE */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginTop: '30px',
        marginBottom: '20px',
        borderBottom: `2px solid ${colors.border}`,
        paddingBottom: '0',
      }}>
        <button
          onClick={() => setCurrentView('task')}
          style={{
            padding: '12px 24px',
            backgroundColor: currentView === 'task' ? colors.primary : 'transparent',
            color: currentView === 'task' ? 'white' : colors.textSecondary,
            border: 'none',
            borderBottom: currentView === 'task' ? `3px solid ${colors.primary}` : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            transition: 'all 0.2s',
          }}
        >
          ✓ Simple Tasks ({taskCount})
        </button>
        <button
          onClick={() => setCurrentView('activity')}
          style={{
            padding: '12px 24px',
            backgroundColor: currentView === 'activity' ? colors.warning : 'transparent',
            color: currentView === 'activity' ? 'white' : colors.textSecondary,
            border: 'none',
            borderBottom: currentView === 'activity' ? `3px solid ${colors.warning}` : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            transition: 'all 0.2s',
          }}
        >
          Activities ({activityCount})
        </button>
      </div>

      {/* ADD TASK FORM */}
      <div style={{
        backgroundColor: currentView === 'task' ? `${colors.primary}15` : `${colors.warning}15`,
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '30px',
        border: `1px solid ${currentView === 'task' ? colors.primary : colors.warning}30`,
      }}>
        <h2 style={{ color: colors.text, marginBottom: '8px' }}>
          {currentView === 'task' ? '✓ Add Simple Task' : 'Add Activity'}
        </h2>
        <p style={{ color: colors.textSecondary, fontSize: '14px', marginTop: '5px', marginBottom: '16px' }}>
          {currentView === 'task'
            ? 'Quick to-do items (e.g., "Pack sunscreen", "Download offline maps")'
            : 'Planned activities for your trip (e.g., "Visit Eiffel Tower", "Dinner at Italian restaurant")'}
        </p>
        <form onSubmit={handleAddActivity}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder={currentView === 'task' ? 'New task...' : 'New activity...'}
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
              onFocus={(e) => {
                e.target.style.borderColor = currentView === 'task' ? colors.primary : colors.warning;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.inputBorder;
              }}
            />
            <button
              type="submit"
              disabled={addingTask}
              style={{
                padding: '12px 24px',
                backgroundColor: addingTask ? colors.textMuted : (currentView === 'task' ? colors.primary : colors.warning),
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: addingTask ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!addingTask) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {addingTask && (
                <div style={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              )}
              {addingTask ? 'Adding...' : 'Add'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '120px' }}>
              <label style={{ fontSize: '12px', color: colors.textSecondary, display: 'block', marginBottom: '4px' }}>
                Priority
              </label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                style={{ ...inputStyle, width: '100%' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ fontSize: '12px', color: colors.textSecondary, display: 'block', marginBottom: '4px' }}>
                Due Date (optional)
              </label>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                min={plan?.startDate}
                max={plan?.endDate}
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ fontSize: '12px', color: colors.textSecondary, display: 'block', marginBottom: '4px' }}>
                Assign to (optional)
              </label>
              <select
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                style={{ ...inputStyle, width: '100%' }}
              >
                <option value="">Unassigned</option>
                {plan?.members?.map(memberId => (
                  <option key={memberId} value={memberId}>
                    {getUserDisplayName(memberId, profiles, auth.currentUser.uid)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* TASKS LIST HEADER WITH SORT */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <h2 style={{ color: colors.text, margin: 0 }}>
          {currentView === 'task' ? '✓ Simple Tasks' : 'Activities'} ({filteredActivities.length})
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: colors.textSecondary }}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              ...inputStyle,
              padding: '8px 12px',
              fontSize: '14px',
              minWidth: '140px',
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
            <option value="completed">Incomplete First</option>
          </select>
        </div>
      </div>
      {filteredActivities.length === 0 ? (
        <div style={{
          color: colors.textMuted,
          textAlign: 'center',
          padding: '60px 40px',
          backgroundColor: colors.backgroundTertiary,
          borderRadius: '12px',
          border: `2px dashed ${colors.border}`,
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {currentView === 'task' ? '✓' : '🎯'}
          </div>
          <p style={{ margin: 0, fontSize: '16px' }}>
            No {currentView === 'task' ? 'tasks' : 'activities'} yet. Add your first {currentView} above!
          </p>
        </div>
      ) : (
        <div className="animate-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredActivities.map(activity => {
            const activityType = activity.type || 'task';
            const isTask = activityType === 'task';
            const isScheduled = activity.scheduledDate;
            const suggestions = activity.dateTimeSuggestions || [];
            const isExpanded = expandedScheduling === activity.id;
            const accentColor = isTask ? colors.primary : colors.warning;

            return (
            <div
              key={activity.id}
              style={{
                padding: '16px',
                backgroundColor: colors.cardBg,
                border: `2px solid ${accentColor}40`,
                borderLeft: `6px solid ${accentColor}`,
                borderRadius: '12px',
                boxShadow: `0 2px 8px ${colors.shadow}`,
                transition: 'all 0.2s ease',
              }}
            >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
            }}>
              <input
                type="checkbox"
                checked={activity.completed}
                onChange={() => handleToggleComplete(activity.id, activity.completed)}
                style={{
                  width: '22px',
                  height: '22px',
                  cursor: 'pointer',
                  accentColor: accentColor,
                }}
                disabled={editingId === activity.id}
              />

              {editingId === activity.id ? (
                <>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    style={{
                      ...inputStyle,
                      flex: 1,
                      borderColor: colors.success,
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
                      padding: '8px 16px',
                      backgroundColor: colors.success,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: colors.textMuted,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <span style={{
                      textDecoration: activity.completed ? 'line-through' : 'none',
                      color: activity.completed ? colors.textMuted : colors.text,
                      fontSize: '16px',
                    }}>
                      {activity.title}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Priority - Admin can edit, others see badge */}
                      {plan.admin === auth.currentUser.uid ? (
                        <select
                          value={activity.priority || 'medium'}
                          onChange={(e) => handleUpdateTaskProperty(activity.id, 'priority', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: activity.priority === 'high' ? colors.dangerLight :
                                            activity.priority === 'low' ? colors.successLight : colors.warningLight,
                            color: activity.priority === 'high' ? colors.danger :
                                   activity.priority === 'low' ? colors.success : colors.warning,
                            border: `1px solid ${activity.priority === 'high' ? colors.danger :
                                    activity.priority === 'low' ? colors.success : colors.warning}40`,
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="low">LOW</option>
                          <option value="medium">MEDIUM</option>
                          <option value="high">HIGH</option>
                        </select>
                      ) : (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '600',
                          backgroundColor: activity.priority === 'high' ? colors.dangerLight :
                                          activity.priority === 'low' ? colors.successLight : colors.warningLight,
                          color: activity.priority === 'high' ? colors.danger :
                                 activity.priority === 'low' ? colors.success : colors.warning,
                        }}>
                          {(activity.priority || 'medium').toUpperCase()}
                        </span>
                      )}
                      {/* Due Date - Admin can edit, others see badge */}
                      {plan.admin === auth.currentUser.uid ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '11px' }}>📅</span>
                          <input
                            type="date"
                            value={activity.dueDate || ''}
                            onChange={(e) => handleUpdateTaskProperty(activity.id, 'dueDate', e.target.value || null)}
                            onClick={(e) => e.stopPropagation()}
                            min={plan?.startDate}
                            max={plan?.endDate}
                            style={{
                              padding: '2px 6px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: '500',
                              backgroundColor: activity.dueDate && new Date(activity.dueDate) < new Date() && !activity.completed
                                ? colors.dangerLight : colors.backgroundTertiary,
                              color: activity.dueDate && new Date(activity.dueDate) < new Date() && !activity.completed
                                ? colors.danger : colors.textSecondary,
                              border: `1px solid ${colors.border}`,
                              cursor: 'pointer',
                              outline: 'none',
                            }}
                          />
                        </div>
                      ) : activity.dueDate ? (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '500',
                          backgroundColor: new Date(activity.dueDate) < new Date() && !activity.completed
                            ? colors.dangerLight : colors.backgroundTertiary,
                          color: new Date(activity.dueDate) < new Date() && !activity.completed
                            ? colors.danger : colors.textSecondary,
                        }}>
                          📅 {activity.dueDate}
                        </span>
                      ) : null}
                      {/* Assignee - Admin can edit, others see badge */}
                      {plan.admin === auth.currentUser.uid ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '11px' }}>👤</span>
                          <select
                            value={activity.assignedTo || ''}
                            onChange={(e) => handleUpdateTaskProperty(activity.id, 'assignedTo', e.target.value || null)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              padding: '2px 6px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: '500',
                              backgroundColor: activity.assignedTo ? colors.purpleLight : colors.backgroundTertiary,
                              color: activity.assignedTo ? colors.purple : colors.textSecondary,
                              border: `1px solid ${colors.border}`,
                              cursor: 'pointer',
                              outline: 'none',
                              maxWidth: '120px',
                            }}
                          >
                            <option value="">Unassigned</option>
                            {plan?.members?.map(memberId => (
                              <option key={memberId} value={memberId}>
                                {getUserDisplayName(memberId, profiles, auth.currentUser.uid)}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : activity.assignedTo ? (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '500',
                          backgroundColor: colors.purpleLight,
                          color: colors.purple,
                        }}>
                          👤 {getUserDisplayName(activity.assignedTo, profiles, auth.currentUser.uid)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartEdit(activity)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: colors.danger,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            {/* SCHEDULING SECTION */}
            <div style={{ marginTop: '15px', borderTop: `1px solid ${colors.border}`, paddingTop: '15px' }}>
              {isScheduled && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                  padding: '12px',
                  backgroundColor: colors.successLight,
                  borderRadius: '8px',
                  border: `1px solid ${colors.success}`,
                }}>
                  <span style={{ fontSize: '20px' }}>📅</span>
                  <div style={{ flex: 1, color: colors.text }}>
                    <strong>Scheduled:</strong> {activity.scheduledDate}
                    {activity.scheduledTime && ` at ${activity.scheduledTime}`}
                  </div>
                  {plan.admin === auth.currentUser.uid && (
                    <button
                      onClick={() => handleUnschedule(activity.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: colors.danger,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                    >
                      Unschedule
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={() => setExpandedScheduling(isExpanded ? null : activity.id)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: isExpanded ? colors.purple : colors.purpleLight,
                  color: isExpanded ? 'white' : colors.purple,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: '100%',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                }}
              >
                {isExpanded ? '▼' : '▶'} Date/Time Suggestions ({suggestions.length})
              </button>

              {isExpanded && (
                <div style={{
                  marginTop: '15px',
                  padding: '16px',
                  backgroundColor: colors.purpleLight,
                  borderRadius: '12px',
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '12px', color: colors.text }}>Suggest Date & Time</h4>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ fontSize: '12px', color: colors.textSecondary, display: 'block', marginBottom: '6px' }}>
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
                          style={{ ...inputStyle, width: '100%' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ fontSize: '12px', color: colors.textSecondary, display: 'block', marginBottom: '6px' }}>
                          Time (optional)
                        </label>
                        <input
                          type="time"
                          value={tempSuggestions[activity.id]?.time || ''}
                          onChange={(e) => setTempSuggestions({
                            ...tempSuggestions,
                            [activity.id]: { ...tempSuggestions[activity.id], time: e.target.value }
                          })}
                          style={{ ...inputStyle, width: '100%' }}
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
                            toast.error('Please select a date');
                          }
                        }}
                        style={{
                          padding: '12px 20px',
                          backgroundColor: colors.purple,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Add Suggestion
                      </button>
                    </div>
                  </div>

                  {suggestions.length === 0 ? (
                    <p style={{ color: colors.textMuted, textAlign: 'center', margin: '20px 0' }}>
                      No suggestions yet. Be the first to suggest a date/time!
                    </p>
                  ) : (
                    <div>
                      <h4 style={{ marginTop: 0, marginBottom: '12px', color: colors.text }}>Suggestions & Votes</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {suggestions.map((suggestion, index) => {
                          const hasVoted = suggestion.votes?.includes(auth.currentUser.uid);
                          const voteCount = suggestion.votes?.length || 0;

                          return (
                            <div
                              key={index}
                              style={{
                                padding: '14px',
                                backgroundColor: colors.cardBg,
                                borderRadius: '10px',
                                border: `1px solid ${colors.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px', color: colors.text }}>
                                  📅 {suggestion.date}
                                  {suggestion.time && ` ⏰ ${suggestion.time}`}
                                </div>
                                <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                                  Suggested by: {getUserDisplayName(suggestion.userId, profiles, auth.currentUser.uid)}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                  onClick={() => handleVoteSuggestion(activity.id, index)}
                                  style={{
                                    padding: '8px 14px',
                                    backgroundColor: hasVoted ? colors.success : colors.backgroundTertiary,
                                    color: hasVoted ? 'white' : colors.text,
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  {hasVoted ? '✓' : '+'} {voteCount}
                                </button>

                                {plan.admin === auth.currentUser.uid && (
                                  <button
                                    onClick={() => handleApproveSuggestion(activity.id, index)}
                                    style={{
                                      padding: '8px 14px',
                                      backgroundColor: colors.primary,
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      fontWeight: 'bold',
                                      fontSize: '12px',
                                    }}
                                  >
                                    ✓ Approve
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

      {/* EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <div className="animate-fadeIn">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ margin: 0, color: colors.text }}>Expense Tracking</h2>
            <button
              onClick={() => setViewExpenses(!viewExpenses)}
              style={{
                padding: '12px 24px',
                backgroundColor: colors.success,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {viewExpenses ? 'Hide' : 'Show'} Expenses ({expenses.length})
            </button>
          </div>

          {viewExpenses && (
            <>
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
                  padding: '14px 24px',
                  backgroundColor: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '20px',
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
              >
                {showExpenseForm ? '✕ Cancel' : '+ Add Expense'}
              </button>

              {showExpenseForm && (
                <div style={{
                  backgroundColor: colors.cardBg,
                  padding: '25px',
                  borderRadius: '12px',
                  marginBottom: '25px',
                  boxShadow: `0 2px 8px ${colors.shadow}`,
                  border: `1px solid ${colors.border}`,
                }}>
                  <h3 style={{ marginTop: 0, color: colors.text }}>{editingExpenseId ? 'Edit' : 'Add'} Expense</h3>
                  <form onSubmit={handleAddExpense}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: colors.text }}>
                        Description *
                      </label>
                      <input
                        type="text"
                        value={expenseFormData.description}
                        onChange={(e) => setExpenseFormData({...expenseFormData, description: e.target.value})}
                        placeholder="e.g., Dinner at restaurant, Hotel booking"
                        required
                        style={{ ...inputStyle, width: '100%' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: colors.text }}>
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
                          style={{ ...inputStyle, width: '100%' }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: colors.text }}>
                          Category
                        </label>
                        <select
                          value={expenseFormData.category}
                          onChange={(e) => setExpenseFormData({...expenseFormData, category: e.target.value})}
                          style={{ ...inputStyle, width: '100%' }}
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

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: colors.text }}>
                        Paid By *
                      </label>
                      <select
                        value={expenseFormData.paidBy}
                        onChange={(e) => setExpenseFormData({...expenseFormData, paidBy: e.target.value})}
                        required
                        style={{ ...inputStyle, width: '100%' }}
                      >
                        <option value="">Select who paid</option>
                        {plan.members.map(memberId => (
                          <option key={memberId} value={memberId}>
                            {getUserDisplayName(memberId, profiles, auth.currentUser.uid)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: colors.text }}>
                        Split Type
                      </label>
                      <select
                        value={expenseFormData.splitType}
                        onChange={(e) => setExpenseFormData({...expenseFormData, splitType: e.target.value})}
                        style={{ ...inputStyle, width: '100%' }}
                      >
                        <option value="even">Split Evenly (All Members)</option>
                        <option value="custom">Custom Split</option>
                        <option value="none">Personal Expense (No Split)</option>
                      </select>
                    </div>

                    {expenseFormData.splitType === 'custom' && (
                      <div style={{
                        padding: '16px',
                        backgroundColor: colors.backgroundTertiary,
                        borderRadius: '10px',
                        marginBottom: '16px',
                      }}>
                        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: colors.text }}>
                          Custom Splits (enter amounts per person)
                        </label>
                        {plan.members.map(memberId => (
                          <div key={memberId} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <label style={{ flex: 1, color: colors.textSecondary }}>
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
                              style={{ ...inputStyle, width: '120px' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="submit"
                        disabled={savingExpense}
                        style={{
                          flex: 1,
                          padding: '14px',
                          backgroundColor: savingExpense ? colors.textMuted : colors.success,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: savingExpense ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                          fontSize: '16px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        {savingExpense && (
                          <div style={{
                            width: 18,
                            height: 18,
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                          }} />
                        )}
                        {savingExpense ? 'Saving...' : `${editingExpenseId ? 'Update' : 'Add'} Expense`}
                      </button>
                      <button
                        type="button"
                        disabled={savingExpense}
                        onClick={() => {
                          setShowExpenseForm(false);
                          setEditingExpenseId(null);
                        }}
                        style={{
                          padding: '14px 28px',
                          backgroundColor: colors.textMuted,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: savingExpense ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                          opacity: savingExpense ? 0.6 : 1,
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
                <h3 style={{ color: colors.text }}>All Expenses</h3>
                {expenses.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: colors.textMuted,
                    padding: '60px 40px',
                    backgroundColor: colors.backgroundTertiary,
                    borderRadius: '12px',
                    border: `2px dashed ${colors.border}`,
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
                    <p style={{ margin: 0 }}>No expenses yet. Add your first expense above!</p>
                  </div>
                ) : (
                  <div className="animate-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                            backgroundColor: colors.cardBg,
                            borderRadius: '12px',
                            border: `1px solid ${colors.border}`,
                            boxShadow: `0 2px 8px ${colors.shadow}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '24px' }}>{categoryIcons[expense.category]}</span>
                                <h4 style={{ margin: 0, color: colors.text }}>{expense.description}</h4>
                              </div>
                              <div style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '8px' }}>
                                <strong style={{ fontSize: '20px', color: colors.success }}>
                                  ${expense.amount.toFixed(2)}
                                </strong>
                                {' • '}
                                Paid by: {getUserDisplayName(expense.paidBy, profiles, auth.currentUser.uid)}
                              </div>
                              <div style={{ fontSize: '12px', color: colors.textMuted }}>
                                Split: {expense.splitType === 'even' ? 'Evenly among all' :
                                        expense.splitType === 'custom' ? 'Custom split' :
                                        'Personal expense'}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                onClick={() => handleEditExpense(expense)}
                                style={{
                                  padding: '8px 16px',
                                  backgroundColor: colors.primary,
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                style={{
                                  padding: '8px 16px',
                                  backgroundColor: colors.danger,
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: '500',
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
                  backgroundColor: colors.warningLight,
                  padding: '25px',
                  borderRadius: '12px',
                  border: `2px solid ${colors.warning}`,
                }}>
                  <h3 style={{ marginTop: 0, color: colors.text }}>Who Owes Whom</h3>
                  {(() => {
                    const settlements = calculateSettlements();

                    if (settlements.length === 0) {
                      return <p style={{ color: colors.textSecondary }}>All settled up! No one owes anyone.</p>;
                    }

                    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

                    return (
                      <>
                        <div style={{
                          marginBottom: '20px',
                          padding: '16px',
                          backgroundColor: colors.cardBg,
                          borderRadius: '10px',
                        }}>
                          <strong style={{ color: colors.text }}>Total Trip Expenses: ${totalExpenses.toFixed(2)}</strong>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {settlements.map((settlement, index) => (
                            <div
                              key={index}
                              style={{
                                padding: '16px',
                                backgroundColor: colors.cardBg,
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                border: `1px solid ${colors.border}`,
                                flexWrap: 'wrap',
                              }}
                            >
                              <div style={{ flex: 1, color: colors.text }}>
                                <strong>{getUserDisplayName(settlement.from, profiles, auth.currentUser.uid)}</strong>
                                {' '}owes{' '}
                                <strong>{getUserOwesName(settlement.to, profiles, auth.currentUser.uid)}</strong>
                              </div>
                              <div style={{
                                padding: '10px 20px',
                                backgroundColor: colors.success,
                                color: 'white',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                fontSize: '16px',
                              }}>
                                ${settlement.amount.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{
                          marginTop: '20px',
                          padding: '16px',
                          backgroundColor: colors.cardBg,
                          borderRadius: '10px',
                          fontSize: '14px',
                          color: colors.textSecondary,
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

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="animate-fadeIn">
          <h2 style={{ color: colors.text, marginBottom: '24px' }}>Plan Analytics</h2>

          {/* Progress Visualization */}
          <div style={{
            backgroundColor: colors.cardBg,
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: `1px solid ${colors.border}`,
            boxShadow: `0 2px 8px ${colors.shadow}`,
          }}>
            <h3 style={{ color: colors.text, marginTop: 0, marginBottom: '20px' }}>📊 Task Progress</h3>
            {(() => {
              const totalTasks = activities.length;
              const completedTasks = activities.filter(a => a.completed).length;
              const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
              const simpleTasks = activities.filter(a => (a.type || 'task') === 'task');
              const activityItems = activities.filter(a => a.type === 'activity');
              const completedSimple = simpleTasks.filter(a => a.completed).length;
              const completedActivities = activityItems.filter(a => a.completed).length;

              return (
                <div>
                  {/* Overall Progress Bar */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: colors.textSecondary, fontWeight: '500' }}>Overall Completion</span>
                      <span style={{ color: colors.text, fontWeight: 'bold' }}>{completedTasks}/{totalTasks} ({taskProgress.toFixed(0)}%)</span>
                    </div>
                    <div style={{
                      height: '24px',
                      backgroundColor: colors.backgroundTertiary,
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${taskProgress}%`,
                        backgroundColor: taskProgress === 100 ? colors.success : colors.primary,
                        borderRadius: '12px',
                        transition: 'width 0.5s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {taskProgress >= 20 && (
                          <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                            {taskProgress.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Breakdown by Type */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{
                      padding: '16px',
                      backgroundColor: `${colors.primary}15`,
                      borderRadius: '10px',
                      border: `1px solid ${colors.primary}30`,
                    }}>
                      <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '4px' }}>Simple Tasks</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.primary }}>{completedSimple}/{simpleTasks.length}</div>
                      <div style={{
                        height: '6px',
                        backgroundColor: colors.backgroundTertiary,
                        borderRadius: '3px',
                        marginTop: '8px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: simpleTasks.length > 0 ? `${(completedSimple / simpleTasks.length) * 100}%` : '0%',
                          backgroundColor: colors.primary,
                          borderRadius: '3px',
                        }} />
                      </div>
                    </div>
                    <div style={{
                      padding: '16px',
                      backgroundColor: `${colors.warning}15`,
                      borderRadius: '10px',
                      border: `1px solid ${colors.warning}30`,
                    }}>
                      <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '4px' }}>Activities</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.warning }}>{completedActivities}/{activityItems.length}</div>
                      <div style={{
                        height: '6px',
                        backgroundColor: colors.backgroundTertiary,
                        borderRadius: '3px',
                        marginTop: '8px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: activityItems.length > 0 ? `${(completedActivities / activityItems.length) * 100}%` : '0%',
                          backgroundColor: colors.warning,
                          borderRadius: '3px',
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Priority Breakdown */}
                  <div style={{ marginTop: '24px' }}>
                    <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '12px', fontWeight: '500' }}>By Priority</div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {['high', 'medium', 'low'].map(priority => {
                        const count = activities.filter(a => (a.priority || 'medium') === priority).length;
                        const completed = activities.filter(a => (a.priority || 'medium') === priority && a.completed).length;
                        const priorityColors = {
                          high: colors.danger,
                          medium: colors.warning,
                          low: colors.success
                        };
                        return (
                          <div key={priority} style={{
                            padding: '12px 16px',
                            backgroundColor: colors.backgroundTertiary,
                            borderRadius: '8px',
                            borderLeft: `4px solid ${priorityColors[priority]}`,
                            minWidth: '100px',
                          }}>
                            <div style={{ fontSize: '12px', color: colors.textMuted, textTransform: 'uppercase' }}>{priority}</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: colors.text }}>{completed}/{count}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Expense Breakdown by Category */}
          <div style={{
            backgroundColor: colors.cardBg,
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: `1px solid ${colors.border}`,
            boxShadow: `0 2px 8px ${colors.shadow}`,
          }}>
            <h3 style={{ color: colors.text, marginTop: 0, marginBottom: '20px' }}>💰 Expense Breakdown</h3>
            {(() => {
              const categoryData = {
                food: { label: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
                lodging: { label: 'Lodging', icon: '🏨', color: '#4ECDC4' },
                transport: { label: 'Transportation', icon: '🚗', color: '#45B7D1' },
                activities: { label: 'Activities', icon: '🎯', color: '#96CEB4' },
                shopping: { label: 'Shopping', icon: '🛍️', color: '#FFEAA7' },
                other: { label: 'Other', icon: '📦', color: '#DDA0DD' }
              };

              const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
              const byCategory = expenses.reduce((acc, e) => {
                acc[e.category] = (acc[e.category] || 0) + e.amount;
                return acc;
              }, {});

              if (expenses.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>💸</div>
                    <p>No expenses recorded yet</p>
                  </div>
                );
              }

              return (
                <div>
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    backgroundColor: colors.successLight,
                    borderRadius: '10px',
                    marginBottom: '20px',
                  }}>
                    <div style={{ fontSize: '14px', color: colors.textSecondary }}>Total Expenses</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: colors.success }}>${totalExpenses.toFixed(2)}</div>
                  </div>

                  {/* Category Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(byCategory)
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, amount]) => {
                        const data = categoryData[category] || categoryData.other;
                        const percentage = (amount / totalExpenses) * 100;
                        return (
                          <div key={category}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ color: colors.text }}>
                                {data.icon} {data.label}
                              </span>
                              <span style={{ color: colors.textSecondary, fontWeight: '500' }}>
                                ${amount.toFixed(2)} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div style={{
                              height: '20px',
                              backgroundColor: colors.backgroundTertiary,
                              borderRadius: '10px',
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${percentage}%`,
                                backgroundColor: data.color,
                                borderRadius: '10px',
                                transition: 'width 0.5s ease',
                              }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Member Contribution Stats */}
          <div style={{
            backgroundColor: colors.cardBg,
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: `1px solid ${colors.border}`,
            boxShadow: `0 2px 8px ${colors.shadow}`,
          }}>
            <h3 style={{ color: colors.text, marginTop: 0, marginBottom: '20px' }}>👥 Member Contributions</h3>
            {(() => {
              const memberStats = plan.members.map(memberId => {
                const tasksCreated = activities.filter(a => a.createdBy === memberId).length;
                const tasksCompleted = activities.filter(a => a.assignedTo === memberId && a.completed).length;
                const tasksAssigned = activities.filter(a => a.assignedTo === memberId).length;
                const expensesPaid = expenses.filter(e => e.paidBy === memberId).reduce((sum, e) => sum + e.amount, 0);
                return {
                  memberId,
                  tasksCreated,
                  tasksCompleted,
                  tasksAssigned,
                  expensesPaid
                };
              });

              const totalPaid = expenses.reduce((sum, e) => sum + e.amount, 0);

              return (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {memberStats.map(stat => (
                    <div key={stat.memberId} style={{
                      padding: '16px',
                      backgroundColor: colors.backgroundTertiary,
                      borderRadius: '10px',
                      border: `1px solid ${colors.border}`,
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '16px',
                          }}>
                            {getUserDisplayName(stat.memberId, profiles, auth.currentUser.uid).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold', color: colors.text }}>
                              {getUserDisplayName(stat.memberId, profiles, auth.currentUser.uid)}
                            </div>
                            {plan.admin === stat.memberId && (
                              <span style={{
                                fontSize: '11px',
                                backgroundColor: colors.success,
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}>Admin</span>
                            )}
                          </div>
                        </div>
                        {stat.expensesPaid > 0 && (
                          <div style={{
                            padding: '6px 12px',
                            backgroundColor: colors.successLight,
                            color: colors.success,
                            borderRadius: '16px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                          }}>
                            Paid ${stat.expensesPaid.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ minWidth: '80px' }}>
                          <div style={{ fontSize: '11px', color: colors.textMuted }}>Tasks Created</div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.primary }}>{stat.tasksCreated}</div>
                        </div>
                        <div style={{ minWidth: '80px' }}>
                          <div style={{ fontSize: '11px', color: colors.textMuted }}>Assigned</div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.warning }}>{stat.tasksAssigned}</div>
                        </div>
                        <div style={{ minWidth: '80px' }}>
                          <div style={{ fontSize: '11px', color: colors.textMuted }}>Completed</div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.success }}>{stat.tasksCompleted}</div>
                        </div>
                        {totalPaid > 0 && stat.expensesPaid > 0 && (
                          <div style={{ minWidth: '80px' }}>
                            <div style={{ fontSize: '11px', color: colors.textMuted }}>% of Expenses</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.text }}>
                              {((stat.expensesPaid / totalPaid) * 100).toFixed(0)}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Timeline View of Activities */}
          <div style={{
            backgroundColor: colors.cardBg,
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: `1px solid ${colors.border}`,
            boxShadow: `0 2px 8px ${colors.shadow}`,
          }}>
            <h3 style={{ color: colors.text, marginTop: 0, marginBottom: '20px' }}>📅 Activity Timeline</h3>
            {(() => {
              const scheduledActivities = activities
                .filter(a => a.scheduledDate)
                .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

              if (scheduledActivities.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
                    <p>No activities scheduled yet</p>
                    <p style={{ fontSize: '14px' }}>Schedule activities from the Tasks & Activities tab</p>
                  </div>
                );
              }

              // Group by date
              const groupedByDate = scheduledActivities.reduce((acc, activity) => {
                const date = activity.scheduledDate;
                if (!acc[date]) acc[date] = [];
                acc[date].push(activity);
                return acc;
              }, {});

              const today = new Date().toISOString().split('T')[0];

              return (
                <div style={{ position: 'relative', paddingLeft: '30px' }}>
                  {/* Timeline Line */}
                  <div style={{
                    position: 'absolute',
                    left: '10px',
                    top: '10px',
                    bottom: '10px',
                    width: '3px',
                    backgroundColor: colors.border,
                    borderRadius: '2px',
                  }} />

                  {Object.entries(groupedByDate).map(([date, dateActivities], index) => {
                    const isPast = date < today;
                    const isToday = date === today;
                    const dateObj = new Date(date + 'T00:00:00');
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    return (
                      <div key={date} style={{ marginBottom: '24px', position: 'relative' }}>
                        {/* Timeline Dot */}
                        <div style={{
                          position: 'absolute',
                          left: '-24px',
                          top: '6px',
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          backgroundColor: isToday ? colors.primary : isPast ? colors.textMuted : colors.success,
                          border: `3px solid ${colors.cardBg}`,
                          boxShadow: `0 0 0 2px ${isToday ? colors.primary : isPast ? colors.textMuted : colors.success}`,
                        }} />

                        {/* Date Header */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '12px',
                        }}>
                          <span style={{
                            fontWeight: 'bold',
                            color: isToday ? colors.primary : colors.text,
                            fontSize: '16px',
                          }}>
                            {dayName}, {monthDay}
                          </span>
                          {isToday && (
                            <span style={{
                              backgroundColor: colors.primary,
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                            }}>TODAY</span>
                          )}
                          {isPast && (
                            <span style={{
                              backgroundColor: colors.textMuted,
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                            }}>PAST</span>
                          )}
                        </div>

                        {/* Activities for this date */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {dateActivities.map(activity => (
                            <div key={activity.id} style={{
                              padding: '12px 16px',
                              backgroundColor: activity.completed ? colors.successLight : colors.backgroundTertiary,
                              borderRadius: '8px',
                              borderLeft: `4px solid ${activity.type === 'activity' ? colors.warning : colors.primary}`,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '8px',
                            }}>
                              <div>
                                <span style={{
                                  color: activity.completed ? colors.textMuted : colors.text,
                                  textDecoration: activity.completed ? 'line-through' : 'none',
                                  fontWeight: '500',
                                }}>
                                  {activity.title}
                                </span>
                                {activity.scheduledTime && (
                                  <span style={{
                                    marginLeft: '10px',
                                    color: colors.textSecondary,
                                    fontSize: '13px',
                                  }}>
                                    ⏰ {activity.scheduledTime}
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {activity.assignedTo && (
                                  <span style={{
                                    fontSize: '12px',
                                    color: colors.purple,
                                    backgroundColor: colors.purpleLight,
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                  }}>
                                    👤 {getUserDisplayName(activity.assignedTo, profiles, auth.currentUser.uid)}
                                  </span>
                                )}
                                {activity.completed && (
                                  <span style={{
                                    fontSize: '12px',
                                    color: colors.success,
                                    fontWeight: 'bold',
                                  }}>✓ Done</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* DAY DETAILS MODAL */}
      {selectedDay && (
        <DayDetailsModal
          date={selectedDay}
          activities={activities}
          onClose={() => setSelectedDay(null)}
          isAdmin={plan.admin === auth.currentUser.uid}
          onUnschedule={handleUnschedule}
        />
      )}

      {/* EXPENSE PROMPT MODAL */}
      {showExpensePrompt && lastCreatedActivity && (
        <div
          style={{
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
            padding: '20px',
          }}
          onClick={() => setShowExpensePrompt(false)}
        >
          <div
            className="animate-scaleIn"
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: `0 8px 32px ${colors.shadow}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, color: colors.text }}>Add Expense?</h3>
            <p style={{ color: colors.textSecondary, marginBottom: '25px' }}>
              Were there any expenses for "{lastCreatedActivity.title}"?
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowExpensePrompt(false);
                  setActiveTab('expenses');
                  setShowExpenseForm(true);
                  setViewExpenses(true);
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
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: colors.success,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Yes, Add Expense
              </button>
              <button
                onClick={() => setShowExpensePrompt(false)}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: colors.textMuted,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
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
