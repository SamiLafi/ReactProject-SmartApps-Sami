// userService.js
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth } from '../services/firebaseConfig';

export const fetchProfileData = async (userId) => {
    const db = getFirestore();
    const userDoc = doc(db, 'users', userId);

    try {
        const snapshot = await getDoc(userDoc);
        if (snapshot.exists()) {
            return snapshot.data();
        } else {
            console.warn('User not found.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
        return null;
    }
};


export const fetchUserFollowersAndFollowing = async (userId, setFollowers, setFollowing, setIsFollowing) => {
    const db = getFirestore();

    // Fetch followers
    const followersRef = collection(db, 'users', userId, 'followers');
    const followersSnapshot = await getDocs(followersRef);
    const followerIds = followersSnapshot.empty ? [] : followersSnapshot.docs.map(doc => doc.id);

    const followerUsers = await Promise.all(
        followerIds.map(async (followerId) => {
            const followerDoc = await getDoc(doc(db, 'users', followerId));
            const followerData = followerDoc.data();
            return followerDoc.exists() ? { id: followerId, username: followerData.username, profilePic: followerData.profilePic, firstName: followerData.firstName, lastName: followerData.lastName } : null;
        })
    );
    setFollowers(followerUsers.filter(Boolean));

    // Fetch following
    const followingRef = collection(db, 'users', userId, 'following');
    const followingSnapshot = await getDocs(followingRef);
    const followingIds = followingSnapshot.empty ? [] : followingSnapshot.docs.map(doc => doc.id);

    const followingUsers = await Promise.all(
        followingIds.map(async (followingId) => {
            const followingDoc = await getDoc(doc(db, 'users', followingId));
            const followingData = followingDoc.data();
            return followingDoc.exists() ? { id: followingId, username: followingData.username, profilePic: followingData.profilePic, firstName: followingData.firstName, lastName: followingData.lastName } : null;
        })
    );
    setFollowing(followingUsers.filter(Boolean));

    // Check if the current user is following the profile
    const currentUserFollowingRef = collection(db, 'users', auth.currentUser.uid, 'following');
    const currentUserFollowingSnapshot = await getDocs(currentUserFollowingRef);
    setIsFollowing(currentUserFollowingSnapshot.docs.some(doc => doc.id === userId));
};
