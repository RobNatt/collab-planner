import { useUserProfiles } from '../hooks/useUserProfile';
import { auth } from '../config/firebase';
import ItineraryViewBody from './ItineraryViewBody';

/** Loads member profiles from Firestore and renders the shared itinerary UI. */
export default function ItineraryView({ plan, activities, expenses }) {
  const { profiles } = useUserProfiles(plan?.members || []);

  return (
    <ItineraryViewBody
      plan={plan}
      activities={activities}
      expenses={expenses}
      profiles={profiles}
      viewerUserId={auth.currentUser?.uid ?? null}
    />
  );
}
