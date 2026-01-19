import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc, deleteDoc  } from 'firebase/firestore';
import { auth } from '../services/firebaseConfig';
import { usePostFetch } from '../contexts/PostFetchProvider';
import { fetchPostsByUserId, fetchPostCount } from '../services/postService';
import { fetchProfileData, fetchUserFollowersAndFollowing } from '../services/userService';

import '../styles/Profile.css';

import StatsModal from '../components/ProfilePage/StatsModal';
import FilterTabs from '../components/ProfilePage/FilterTabs';
import ProfileHeader from '../components/ProfilePage/ProfileHeader';
import UserPostList from '../components/ProfilePage/UserPostList';


const db = getFirestore();
var limitNumber = 0;

const Profile = () => {

    const { userPosts, setUserPosts, hasUserFetchedPosts, setUserHasFetchedPosts, handleDeletePost } = usePostFetch(); // Get post context

    const { userId } = useParams();
    const [postCount, setPostCount] = useState(null);
    const [profileUser, setProfileUser] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [selectedTab, setSelectedTab] = useState("all");
    const [isFollowing, setIsFollowing] = useState(false);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editBio, setEditBio] = useState("");

    const [hasMorePosts, setHasMorePosts] = useState(true); // Indicates if there are more posts to fetch
    const [hasReachedBottom, setHasReachedBottom] = useState(false); // Track if the bottom has been reached

    const navigate = useNavigate();

    const isCurrentUserProfile = auth.currentUser && auth.currentUser.uid === userId;


    useEffect(() => {
        fetchFirstPosts();
    }, [userId, profileUser]); // Trigger when profileUser or userId changes


    useEffect(() => {
        if (!hasUserFetchedPosts) {
        console.log("Initial fetch triggered");
        getPosts();
        setUserHasFetchedPosts(true); // Mark as fetched only once
        }
    }, [hasUserFetchedPosts, setUserHasFetchedPosts]);

    useEffect(() => {
        const fetchData = async () => {
            await fetchUserFollowersAndFollowing(userId, setFollowers, setFollowing, setIsFollowing);
        };

        const getProfileData = async () => {
            const profileData = await fetchProfileData(userId);
            if (profileData) {
                setProfileUser(profileData);
            }
        };

        fetchData();
        getProfileData();
    }, [userId]);

    useEffect(() => {
        const onscroll = () => {
            const homePageElement = document.querySelector('.profile-container');

            if (!homePageElement) return; // Check if the element exists

            // Check if the user has reached the bottom of the home page
            const atBottom = window.innerHeight + window.scrollY >= homePageElement.scrollHeight;

            if (atBottom && !hasReachedBottom) {
            if (hasMorePosts) {
                getPosts();
            }

            setHasReachedBottom(true); // Set the flag to true after reaching the bottom
            } else if (!atBottom && hasReachedBottom) {
            setHasReachedBottom(false); // Reset the flag when the user scrolls up
            }
        };

        window.addEventListener("scroll", onscroll);

        return () => {
            window.removeEventListener("scroll", onscroll);
        };
    }, [hasReachedBottom]);


    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-menu') && !event.target.closest('.menu-button')) {
                setUserPosts(userPosts.map(post => ({ ...post, showMenu: false })));
            }
        };
    
        document.addEventListener('click', handleClickOutside);
    
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [userPosts]);
    
    
    // Usage in React Component
    useEffect(() => {
        const getPostCount = async () => {
            const count = await fetchPostCount(userId);
            setPostCount(count);
        };
    
        getPostCount();
    }, [userPosts]);


    const fetchFirstPosts = async () => {
        if (!profileUser) return; // Avoid fetching posts if profileUser is not set yet
        limitNumber = 10; // Reset limitNumber for new profile user
        let res = await fetchPostsByUserId(userId, limitNumber);

        setUserPosts(res.data);

        if (res.data.length < limitNumber) {
            setHasMorePosts(false); // No more posts to load
        } else {
            setHasMorePosts(true);
        }
        setHasReachedBottom(false); // Reset the bottom reached flag after fetching new posts
    };
    

    const getPosts = async () => {
        limitNumber = limitNumber + 10;
        let res = await fetchPostsByUserId(userId, limitNumber);
        
        setUserPosts(res.data);

        if (res.data.length < limitNumber) {
            setHasMorePosts(false); // No more posts to load
        }else{
            setHasMorePosts(true); // No more posts to load
        }
        
        console.log("got posts result: ", res);
        setHasReachedBottom(false); // Reset the bottom reached flag after fetching new posts
    };
    

    const toggleEditPost = (postId, currentBio) => {
        setEditingPostId(postId); // Set the post being edited
        setEditBio(currentBio);   // Initialize the edit field with the current bio
    };
    
    const handleUpdatePost = async (postId) => {
        const postRef = doc(db, 'posts', postId);
        
        try {
          await setDoc(postRef, { 
            posts_bio: editBio, 
            posts_edited: true  // Set to true when edited
          }, { merge: true });  // Use merge to update only these fields
          
          // Update the posts state locally
          setUserPosts(userPosts.map(post => 
            post.id === postId ? { ...post, posts_bio: editBio, posts_edited: true } : post
          ));
          
          setEditingPostId(null);  // Exit edit mode
        } catch (error) {
          console.error("Error updating post:", error);
          alert("Failed to update the post. Please try again.");
        }
    };

    const handleProfileEdit = () => {
        navigate('/profile-edit');
    };
    
    const handleFollowToggle = async () => {
        const currentUserId = auth.currentUser.uid;
        const followingRef = doc(db, 'users', currentUserId, 'following', userId);
        const followersRef = doc(db, 'users', userId, 'followers', currentUserId);
    
        if (isFollowing) {
            await deleteDoc(followingRef);
            await deleteDoc(followersRef);
            setIsFollowing(false);
        } else {
            await setDoc(followingRef, { followerId: userId, followedAt: new Date() });
            await setDoc(followersRef, { followerId: currentUserId, followedAt: new Date() });
            setIsFollowing(true);
        }
    };

    const handleSendMessage = () => {
        navigate(`/messages/${userId}`, { state: { userId } });
    };
    
    const handleStory = () => {
        navigate("/story");
    };

    return (
        <div className="profile-container">
            <ProfileHeader
                profileUser={profileUser}
                isCurrentUserProfile={isCurrentUserProfile}
                isFollowing={isFollowing}
                handleProfileEdit={handleProfileEdit}
                handleStory={handleStory}
                handleFollowToggle={handleFollowToggle}
                handleSendMessage={handleSendMessage}
            />

            <StatsModal postCount={postCount} followers={followers} following={following} />

            <FilterTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
            
            <UserPostList
                userPosts={userPosts}
                selectedTab={selectedTab}
                isCurrentUserProfile={isCurrentUserProfile}
                setUserPosts={setUserPosts}
                toggleEditPost={toggleEditPost}
                handleDeletePost={handleDeletePost}
                editingPostId={editingPostId}
                setEditingPostId={setEditingPostId}
                editBio={editBio}
                setEditBio={setEditBio}
                handleUpdatePost={handleUpdatePost}
            />
        </div>
    );
};

export default Profile;
