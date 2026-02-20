import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';

/**
 * Renders nothing — purely listens to React Router location changes
 * and fires a GA4 page_view event on every route transition.
 *
 * Place this as the first child inside <BrowserRouter> so it catches
 * every route including the initial load.
 */
export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackEvent('page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location]);

  return null;
}
