import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import '../../styles/StatsModal.css';

const StatsModal = ({ postCount, followers, following }) => {
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [searchFollowers, setSearchFollowers] = useState('');
    const [searchFollowing, setSearchFollowing] = useState('');
    
    const navigate = useNavigate(); // Initialize the navigate function

    const toggleFollowersModal = () => setShowFollowersModal(!showFollowersModal);
    const toggleFollowingModal = () => setShowFollowingModal(!showFollowingModal);

    // Function to handle profile click and close the modal
    const handleProfileClick = (userId, isFollower) => {
        navigate(`/profile/${userId}`); // Navigate to the profile page of the clicked user
        if (isFollower) {
            setShowFollowersModal(false); // Close the followers modal
        } else {
            setShowFollowingModal(false); // Close the following modal
        }
    };

    return (
        <div>
            <div className="stats">
                <div><span>{postCount}</span> Posts</div>
                <div onClick={toggleFollowersModal} style={{ cursor: 'pointer' }}>
                    <span>{followers.length}</span> Volgers
                </div>
                <div onClick={toggleFollowingModal} style={{ cursor: 'pointer' }}>
                    <span>{following.length}</span> Volgend
                </div>
            </div>

            {showFollowersModal && (
                <>
                <div className="modal-overlay" onClick={toggleFollowersModal}></div>
                <div className="modal">
                    <div className="modal-content">
                        <h2>Volgers</h2>
                        <input
                            type="text"
                            placeholder="Zoek naar volgers..."
                            value={searchFollowers}
                            onChange={(e) => setSearchFollowers(e.target.value)}
                            className="search-input"
                        />
                        <ul className="scrollable-list">
                            {followers
                                .filter(
                                    (follower) =>
                                        follower.username.toLowerCase().includes(searchFollowers.toLowerCase()) ||
                                        `${follower.firstName} ${follower.lastName}`.toLowerCase().includes(searchFollowers.toLowerCase())
                                )
                                .map((follower) => (
                                    <li key={follower.id} className="list-item" onClick={() => handleProfileClick(follower.id, true)}>
                                        {/* Profielfoto */}
                                        <img
                                            src={follower.profilePic || "default-profile-pic-url"}
                                            alt={`${follower.username}'s profile`}
                                        />
                                        {/* Naam en gebruikersnaam */}
                                        <div className="list-item-text">
                                            {/* Voor- en achternaam */}
                                            <div className="name">
                                                {follower.firstName} {follower.lastName}
                                            </div>
                                            {/* Gebruikersnaam */}
                                            <div className="username">@{follower.username}</div>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                        <button onClick={toggleFollowersModal} className="close-button">
                            Sluiten
                        </button>
                    </div>
                </div>
                </>
            )}

            {showFollowingModal && (
                <>
                <div className="modal-overlay" onClick={toggleFollowingModal}></div>
                <div className="modal">
                    <div className="modal-content">
                        <h2>Volgend</h2>
                        <input
                            type="text"
                            placeholder="Zoek naar gevolgd..."
                            value={searchFollowing}
                            onChange={(e) => setSearchFollowing(e.target.value)}
                            className="search-input"
                        />
                        <ul className="scrollable-list">
                            {following
                            .filter(
                                (following) =>
                                    following.username.toLowerCase().includes(searchFollowing.toLowerCase()) ||
                                    `${following.firstName} ${following.lastName}`.toLowerCase().includes(searchFollowing.toLowerCase())
                            )
                            .map((following) => (
                                <li key={following.id} className="list-item" onClick={() => handleProfileClick(following.id, false)}>
                                    {/* Profielfoto */}
                                    <img 
                                        src={following.profilePic || "default-profile-pic-url"} 
                                        alt={`${following.username}'s profile`} 
                                    />
                                    {/* Naam en gebruikersnaam */}
                                    <div className="list-item-text">
                                        {/* Voor- en achternaam */}
                                        <div className="name">
                                            {following.firstName} {following.lastName}
                                        </div>
                                        {/* Gebruikersnaam */}
                                        <div className="username">
                                            @{following.username}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button onClick={toggleFollowingModal} className="close-button">
                            Sluiten
                        </button>
                    </div>
                </div>
                </>
            )}
        </div>
    );
};

export default StatsModal;
