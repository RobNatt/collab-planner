import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('collab-planner-notifications') === 'true';
  });

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied';

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setEnabled(true);
        localStorage.setItem('collab-planner-notifications', 'true');
      }
      return result;
    } catch {
      return 'denied';
    }
  }, []);

  const toggleNotifications = useCallback(() => {
    if (!enabled && permission !== 'granted') {
      requestPermission();
    } else {
      const newState = !enabled;
      setEnabled(newState);
      localStorage.setItem('collab-planner-notifications', String(newState));
    }
  }, [enabled, permission, requestPermission]);

  const sendNotification = useCallback((title, options = {}) => {
    if (!enabled || permission !== 'granted') return;
    if (typeof Notification === 'undefined') return;

    // Don't notify if the tab is focused
    if (document.hasFocus()) return;

    try {
      const notification = new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch {
      // Silently fail
    }
  }, [enabled, permission]);

  return {
    permission,
    enabled,
    requestPermission,
    toggleNotifications,
    sendNotification,
    isSupported: typeof Notification !== 'undefined',
  };
}
