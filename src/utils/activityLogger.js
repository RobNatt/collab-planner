import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

/**
 * Log an activity to the activity feed
 * @param {string} planId - The plan ID
 * @param {string} type - Activity type (e.g., 'task_created', 'expense_added')
 * @param {string} message - Human-readable message (e.g., 'added a new task')
 * @param {string} details - Optional details (e.g., task title)
 */
export const logActivity = async (planId, type, message, details = null) => {
  if (!planId || !auth.currentUser) return;

  try {
    await addDoc(collection(db, 'activityLogs'), {
      planId,
      type,
      message,
      details,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // Silently fail - activity logging shouldn't break main functionality
    console.error('Error logging activity:', error);
  }
};

// Convenience functions for common activity types
export const logTaskCreated = (planId, taskTitle) =>
  logActivity(planId, 'task_created', 'added a new task', taskTitle);

export const logTaskCompleted = (planId, taskTitle) =>
  logActivity(planId, 'task_completed', 'completed a task', taskTitle);

export const logTaskUncompleted = (planId, taskTitle) =>
  logActivity(planId, 'task_uncompleted', 'marked a task as incomplete', taskTitle);

export const logTaskDeleted = (planId, taskTitle) =>
  logActivity(planId, 'task_deleted', 'deleted a task', taskTitle);

export const logTaskEdited = (planId, taskTitle) =>
  logActivity(planId, 'task_edited', 'edited a task', taskTitle);

export const logActivityCreated = (planId, activityTitle) =>
  logActivity(planId, 'activity_created', 'added a new activity', activityTitle);

export const logActivityScheduled = (planId, activityTitle, date) =>
  logActivity(planId, 'activity_scheduled', `scheduled an activity for ${date}`, activityTitle);

export const logActivityUnscheduled = (planId, activityTitle) =>
  logActivity(planId, 'activity_unscheduled', 'removed an activity from the schedule', activityTitle);

export const logExpenseAdded = (planId, description, amount) =>
  logActivity(planId, 'expense_added', `added an expense of $${amount.toFixed(2)}`, description);

export const logExpenseDeleted = (planId, description) =>
  logActivity(planId, 'expense_deleted', 'deleted an expense', description);

export const logMemberJoined = (planId) =>
  logActivity(planId, 'member_joined', 'joined the plan');

export const logMemberLeft = (planId) =>
  logActivity(planId, 'member_left', 'left the plan');

export const logMemberRemoved = (planId, memberName) =>
  logActivity(planId, 'member_removed', `removed ${memberName} from the plan`);

export const logCommentAdded = (planId, itemTitle) =>
  logActivity(planId, 'comment_added', 'commented on', itemTitle);

export const logVoteCast = (planId, activityTitle) =>
  logActivity(planId, 'vote_cast', 'voted on a date suggestion for', activityTitle);
