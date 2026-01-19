import { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { auth } from '../services/firebaseConfig';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store the logged-in user
  const [friends, setFriends] = useState([]); // Store the friends list

  // Load user and friends data from localStorage when the app loads
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedFriends = localStorage.getItem('friends');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedFriends) {
      setFriends(JSON.parse(storedFriends));
    }
  }, []);

  // Save user data to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Save friends data to localStorage when it changes
  useEffect(() => {
    if (friends.length > 0) {
      localStorage.setItem('friends', JSON.stringify(friends));
    } else {
      localStorage.removeItem('friends');
    }
  }, [friends]);

  // Fetch friends for the logged-in user
  const fetchFriends = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const db = getFirestore();
        const userRef = doc(db, 'users', currentUser.uid);
  
        // Fetch the 'following' and 'followers' collections of the logged-in user
        const [followingSnapshot, followersSnapshot] = await Promise.all([
          getDocs(collection(userRef, 'following')), // IDs of users the current user follows
          getDocs(collection(userRef, 'followers')), // IDs of users who follow the current user
        ]);
  
        // Extract the IDs from the snapshots
        const followingIds = new Set(followingSnapshot.docs.map((doc) => doc.id)); // IDs of following users
        const followersIds = new Set(followersSnapshot.docs.map((doc) => doc.id)); // IDs of followers
  
        // Identify mutual connections (users in both following and followers)
        const mutualIds = [...followingIds].filter((id) => followersIds.has(id));
  
        // Fetch detailed data for mutual connections
        const friendsPromises = mutualIds.map(async (friendId) => {
          const friendRef = doc(db, 'users', friendId);
          const friendSnapshot = await getDoc(friendRef);
          return { id: friendId, ...friendSnapshot.data() }; // Combine ID with user data
        });
  
        const friendsList = await Promise.all(friendsPromises);
        setFriends(friendsList); // Update the friends state
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, friends, setFriends, fetchFriends }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => useContext(UserContext);
