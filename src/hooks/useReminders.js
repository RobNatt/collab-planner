import { useEffect, useRef } from 'react';
import { useNotifications } from './useNotifications';

/**
 * Hook that checks for upcoming tasks/activities and sends browser reminders
 * Runs a check every 30 minutes while the plan is open
 */
export function useReminders(plan, activities = []) {
  const { sendNotification, enabled } = useNotifications();
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if (!enabled || !plan || activities.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Check for trip starting tomorrow
      if (plan.startDate === tomorrowStr && !notifiedRef.current.has('trip-start')) {
        sendNotification(`${plan.name} starts tomorrow!`, {
          body: 'Make sure everything is ready for your trip.',
          tag: 'reminder-trip-start',
        });
        notifiedRef.current.add('trip-start');
      }

      // Check for trip starting today
      if (plan.startDate === today && !notifiedRef.current.has('trip-today')) {
        sendNotification(`${plan.name} starts today!`, {
          body: 'Your trip is starting. Have a great time!',
          tag: 'reminder-trip-today',
        });
        notifiedRef.current.add('trip-today');
      }

      // Check for tasks due today
      const tasksDueToday = activities.filter(
        a => a.dueDate === today && !a.completed
      );
      if (tasksDueToday.length > 0 && !notifiedRef.current.has(`tasks-due-${today}`)) {
        sendNotification(`${tasksDueToday.length} task(s) due today`, {
          body: tasksDueToday.map(t => t.title).join(', '),
          tag: 'reminder-tasks-today',
        });
        notifiedRef.current.add(`tasks-due-${today}`);
      }

      // Check for tasks due tomorrow
      const tasksDueTomorrow = activities.filter(
        a => a.dueDate === tomorrowStr && !a.completed
      );
      if (tasksDueTomorrow.length > 0 && !notifiedRef.current.has(`tasks-due-${tomorrowStr}`)) {
        sendNotification(`${tasksDueTomorrow.length} task(s) due tomorrow`, {
          body: tasksDueTomorrow.map(t => t.title).join(', '),
          tag: 'reminder-tasks-tomorrow',
        });
        notifiedRef.current.add(`tasks-due-${tomorrowStr}`);
      }

      // Check for scheduled activities today
      const activitiesToday = activities.filter(
        a => a.scheduledDate === today && !a.completed
      );
      if (activitiesToday.length > 0 && !notifiedRef.current.has(`activities-${today}`)) {
        sendNotification(`${activitiesToday.length} activity today`, {
          body: activitiesToday.map(a => a.title).join(', '),
          tag: 'reminder-activities-today',
        });
        notifiedRef.current.add(`activities-${today}`);
      }
    };

    // Check immediately on load
    checkReminders();

    // Then check every 30 minutes
    const interval = setInterval(checkReminders, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [enabled, plan, activities, sendNotification]);
}
