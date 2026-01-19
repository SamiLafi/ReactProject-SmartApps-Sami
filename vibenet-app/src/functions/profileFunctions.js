import { useState, useEffect } from 'react';
import { getDoc, doc, getFirestore } from 'firebase/firestore';

const useUserProfile = (userId) => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');

    const fetchUserProfile = async () => {
        const db = getFirestore();
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUsername(userData.username);
                setFirstName(userData.firstName || "");
                setLastName(userData.lastName || "");
                setBio(userData.bio || "Dit is je bio...");
                setProfilePhoto(userData.profilePic || "https://via.placeholder.com/150");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserProfile(); // Initial fetch when the component mounts or userId changes
        }
    });

    // Return the state variables and the fetch function
    return { username, firstName, lastName, bio, profilePhoto, fetchUserProfile };
};

export default useUserProfile;
