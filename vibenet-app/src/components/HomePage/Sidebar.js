import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserProvider';
import Modal from './Modal';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../../styles/Home.css';

const app = getApp();
const db = getFirestore(app);

const Sidebar = () => {
  const { user, friends, fetchFriends } = useUser();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchVideoUrl = async (friendId) => {
    try {
      const friendDoc = await getDoc(doc(db, 'friends', friendId));
      const friendData = friendDoc.data();
      console.log('Friend data:', friendData);
      return friendData?.videoUrl;
    } catch (error) {
      console.error('Error fetching video URL:', error);
      return null;
    }
  };

  const handleStoryClick = async (friendId) => {
    const videoUrl = await fetchVideoUrl(friendId);

    const friend = friends.find((friend) => friend.id === friendId);

    const friendData = {
      ...friend,
      videoUrl: videoUrl,
    };

    setSelectedFriend(friendData);
  };

  const handleProfileClick = (friendId) => {
    navigate(`/profile/${friendId}`); // Navigate to the profile page
  };

  useEffect(() => {
    fetchFriends();
  }, [user]);

  const closeStoryModal = () => {
    setSelectedFriend(null);
  };

  return (
    <div className='sidebar-container'>
      <div className='friends-section'>
        <h3>Vrienden</h3>
        <div className='friends-items'>
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div
                key={friend.id}
                className='friend'
                onClick={() => handleProfileClick(friend.id)} // Navigate to profile on click
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={friend.profilePic || 'https://via.placeholder.com/50'}
                  alt={`${friend.username}'s profile`}
                  className={`friend-profile-pic ${
                    friend.videoUrl ? 'has-story' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the parent onClick from firing
                    handleStoryClick(friend.id); // Open story on profile picture click
                  }}
                  style={{ cursor: 'pointer' }}
                />
                {/* Naam en gebruikersnaam */}
                <div className="list-item-text">
                    {/* Voor- en achternaam */}
                    <div className="name">
                        {friend.firstName} {friend.lastName}
                    </div>
                    {/* Gebruikersnaam */}
                    <div className="username">@{friend.username}</div>
                </div>
              </div>
            ))
          ) : (
            <p>Je hebt nog geen vrienden.</p>
          )}
        </div>
      </div>

      {selectedFriend && (
        <Modal friend={selectedFriend} onClose={closeStoryModal} />
      )}
    </div>
  );
};

export default Sidebar;