import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useUserProfile(userId, refreshTrigger = 0) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() });
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, refreshTrigger]);

  return { profile, loading };
}

// Hook to fetch multiple user profiles
export function useUserProfiles(userIds) {
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchProfiles = async () => {
      try {
        const profilesData = {};

        await Promise.all(
          userIds.map(async (userId) => {
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              profilesData[userId] = { id: docSnap.id, ...docSnap.data() };
            } else {
              // Fallback to email if no profile
              profilesData[userId] = { displayName: userId, email: userId };
            }
          })
        );

        setProfiles(profilesData);
      } catch (error) {
        console.error('Error fetching user profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [JSON.stringify(userIds)]);

  return { profiles, loading };
}
