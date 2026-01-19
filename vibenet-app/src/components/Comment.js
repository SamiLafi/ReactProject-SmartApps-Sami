import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc as firestoreDoc, deleteDoc } from 'firebase/firestore';
import { auth } from '../services/firebaseConfig'; // Ensure this path matches your project structure
import '../styles/Comment.css'; // Add CSS for styling the dropdown menu

const Comment = ({ comment }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentUser = auth.currentUser;
  const menuRef = useRef(null); // Reference to the dropdown menu

  const handleDeleteComment = async () => {
    const db = getFirestore();
    try {
      await deleteDoc(firestoreDoc(db, 'posts', comment.postId, 'comments', comment.id));
      console.log("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment: ", error);
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Cleanup event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="comment">
      <div className="comment-header">
        <img 
          className="comment-profile-pic" 
          src={comment.comment_profilePic || "https://via.placeholder.com/50"} 
          alt="Profile pic" 
        />
        <div className="comment-user-info">
          <p className="comment-names">{comment.comment_firstName} {comment.comment_lastName}</p>
          <p className="comment-username">@{comment.username}</p>
        </div>

        {currentUser && currentUser.uid === comment.userId && (
          <div className="post-menu" ref={menuRef}>
            <button className="menu-button" onClick={toggleMenu}>&#x22EE;</button>
            {menuOpen && (
              <div className="dropdown-menu">
                <button onClick={handleDeleteComment} className="dropdown-item">Delete</button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="comment-text">
        <p>{comment.commentText}</p>
      </div>
    </div>
  );
};

export default Comment;
