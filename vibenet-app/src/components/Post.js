import React, { useState, useEffect } from 'react';
import '../styles/Post.css';  // Import the CSS file
import { auth } from '../services/firebaseConfig';
import { collection, query, getDocs, getFirestore } from 'firebase/firestore'; // Import Firestore functions

const db = getFirestore();

// Utility function to format the time difference
const timeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp.toDate(); // Difference in milliseconds

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days}d`;  // Display days
    } else if (hours > 0) {
        return `${hours}h`;  // Display hours
    } else if (minutes > 0) {
        return `${minutes}m`;  // Display minutes
    } else {
        return `${seconds}s`;  // Display seconds
    }
};

const Post = ({ post, onLike, onComment, onHeaderClick, liked }) => {
    const currentUser = auth.currentUser;
    const [commentsCount, setCommentsCount] = useState(0); // State to store the number of comments
    const [postTimeAgo, setPostTimeAgo] = useState(""); // State for time ago

    useEffect(() => {
        // Fetch the number of comments in the "comments" sub-collection for the given post
        const fetchCommentsCount = async () => {
            const commentsRef = collection(db, 'posts', post.id, 'comments'); // Reference to the comments sub-collection
            const q = query(commentsRef); // Query all documents in the "comments" collection
            const querySnapshot = await getDocs(q);
            setCommentsCount(querySnapshot.size); // Set the comments count
        };

        // Calculate the time ago
        if (post.createdAt) {
            setPostTimeAgo(timeAgo(post.createdAt));
        }

        // Fetch comments count when the component mounts or when the post ID changes
        if (post.id) {
            fetchCommentsCount();
        }
    }, [post.id, post.createdAt]); // Dependency on post.id and post.createdAt to re-fetch if the post changes

    // Check if the current user has liked the post
    const isLikedByCurrentUser = post.likedBy && post.likedBy.includes(currentUser?.uid);

    // Web Share API function
    const sharePost = async (post) => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: post.posts_bio,
                    text: post.posts_bio,
                    url: window.location.href,
                });
                console.log("Content shared successfully");
            } else {
                alert("Sharing is not supported on this device");
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    return (
        <div className="post">
          <div className="post-header" onClick={() => onHeaderClick(post.posts_userId)} style={{ cursor: 'pointer' }}>
            <img className="post-profile-pic" src={post.posts_profilePic || "https://via.placeholder.com/50"} alt="Profile pic" />
            <div className="post-user-info">
              <p className="post-username">{post.posts_firstName} {post.posts_lastName}</p>
              <p className="post-handle">@{post.posts_userName}</p>
            </div>
            {/* Display the time ago */}
            <div className="post-date">
              <p>{postTimeAgo}</p>
            </div>
          </div>
          <p className="post-description">
            {post.posts_bio}
          </p>
          {post.posts_edited && <span className="post-edited"> (edited)</span>}
          {post.posts_type === 'post' && post.imageUrl && (
            <div className="post-pic">
              <img src={post.imageUrl} alt="Post content" />
            </div>
          )}
          <div className="post-actions">
            <button className="like-button" onClick={() => onLike(post.id)}>
              {isLikedByCurrentUser ? (
                <span role="img" aria-label="Filled heart">❤️</span>
              ) : (
                <span role="img" aria-label="Empty heart">🤍</span>
              )}
              Like {post.likes}
            </button>

            <button className="comment-button" onClick={() => onComment(post.id)}>
              💬 Comment {commentsCount || 0}
            </button>
            
            {/* Share Button */}
            <button className="share-button" onClick={() => sharePost(post)}>
              📤 Share
            </button>
          </div>
        </div>
      );
};

export default Post;