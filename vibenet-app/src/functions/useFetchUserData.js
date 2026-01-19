import { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

const useFetchUserData = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, []);

  return user;
};

export default useFetchUserData;
