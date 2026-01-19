import React from 'react';
import { auth } from '../../services/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { useUser } from '../../contexts/UserProvider'; // Import the useUser hook

const ProfileHeader = ({
  profileUser,
  isCurrentUserProfile,
  isFollowing,
  handleProfileEdit,
  handleStory,
  handleFollowToggle,
  handleSendMessage,
}) => {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await auth.signOut(); // Sign out the user
            setUser(null); // Clear user data from context
            navigate('/login'); // Redirect to the login page
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

  return (
    <div className="profile-header">
      <img src={profileUser?.profilePic} alt="Profilepic" className="profile-photo" />
      <div className="profile-info">
        <p className="profile-name">{profileUser?.firstName} {profileUser?.lastName}</p>
        <p className="profile-username">@{profileUser?.username}</p>
        <p className="profile-bio">{profileUser?.bio}</p>
        {isCurrentUserProfile ? (
          <>
            <button className="edit-button" onClick={handleProfileEdit}>
              Profiel Bewerken
            </button>
            <button className="story-button" onClick={handleStory}>
              Story
            </button>
            <div className='logout-container'>
              <button onClick={handleLogout} className="logout-button">
                <FaSignOutAlt className="icon" />
                <span>Logout</span>
              </button>
            </div>
          </>
        ) : (
          <div className="header-buttons">
            <button
              className={`follow-button ${isFollowing ? 'following' : ''}`}
              onClick={handleFollowToggle}
            >
              {isFollowing ? 'Volgend' : 'Volgen'}
            </button>
            <button className="message-button" onClick={handleSendMessage}>
              Berichten
            </button>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default ProfileHeader;
