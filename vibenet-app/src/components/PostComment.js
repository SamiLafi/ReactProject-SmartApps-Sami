import React from 'react';
import '../styles/PostComments.css';


const PostComment = ({ post }) => (
  <div className="posts-comment-wrapper">
    <div className="post-comment">
      <div className="post-header">
        <img 
          className="post-profile-pic" 
          src={post.posts_profilepic || "https://via.placeholder.com/50"} 
          alt="Profile pic" 
        />
        <div className="post-user-info">
          <p className="post-username">{post.posts_firstname} {post.posts_lastname}</p>
          <p className="post-handle">@{post.posts_username}</p>
        </div>
      </div>

        <p className="post-description">{post.posts_bio}</p>
        {post.posts_edited && ( // Conditionally render "(edited)"
          <span className="post-edited"> (edited)</span>
        )}
        {post.posts_type === 'post' && post.imageUrl && (
          <div className="post-comment-pic">
            <img src={post.imageUrl} alt="Post content" />
          </div>
        )}
        
      <div className="post-actions">
        <button className="like-button" >
          ❤️ Like {post.likes}
        </button>
      </div>
    </div>
  </div>
);

export default PostComment;
