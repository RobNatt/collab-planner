import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useLicense(userId) {
  const [isLTD, setIsLTD] = useState(false);
  const [loading, setLoading] = useState(true);
  const [license, setLicense] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const checkLicense = async () => {
      try {
        const licenseDoc = await getDoc(doc(db, 'licenses', userId));
        if (licenseDoc.exists()) {
          const data = licenseDoc.data();
          setLicense(data);
          setIsLTD(data.status === 'active');
        } else {
          setIsLTD(false);
          setLicense(null);
        }
      } catch {
        setIsLTD(false);
        setLicense(null);
      }
      setLoading(false);
    };

    checkLicense();
  }, [userId]);

  return { isLTD, loading, license };
}
