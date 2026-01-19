import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import '../styles/Navigation.css';
import { doc, getDoc, getFirestore } from 'firebase/firestore'; // Firestore functions
import { useUser } from '../contexts/UserProvider'; // Import the useUser hook
import { FaHome, FaUser, FaCompass, FaPlayCircle } from 'react-icons/fa';

const db = getFirestore();

const Navigation = () => {
  const { user, setUser } = useUser();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid); // Reference to user document
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser(userSnap.data()); // Set fetched data in state
        } else {
          console.log('No such user!');
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  if (!currentUser || !user) return <div></div>;

  return (
    <footer className="bottom-navbar">
      <ul>
        <li>
          <Link to="/home">
            <FaHome className="icon" />
            <span>Home</span>
          </Link>
        </li>
        <li>
          <Link to={`/profile/${currentUser.uid}`}>
            <FaUser className="icon" />
            <span>Profile</span>
          </Link>
        </li>
        <li>
          <Link to="/explore">
            <FaCompass className="icon" />
            <span>Explore</span>
          </Link>
        </li>
        <li>
          <Link to="/story">
            <FaPlayCircle className="icon" />
            <span>Story</span>
          </Link>
        </li>
      </ul>
    </footer>
  );
};

export default Navigation;
