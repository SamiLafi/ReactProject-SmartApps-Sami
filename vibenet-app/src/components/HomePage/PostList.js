import React from 'react';
import Post from '../Post';

const PostList = ({ posts, onLike, onComment, onHeaderClick, filter }) => {
  // Sort posts based on the selected filter
  const sortedPosts = [...posts]; // Create a copy of the posts array to avoid mutation

  if (filter === "newest") {
    sortedPosts.sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first
  } else if (filter === "mostLikes") {
    sortedPosts.sort((a, b) => b.likes - a.likes); // Sort by most liked first
  }

  return (
    <div className="post-list">
      {sortedPosts.map((post) => (
        <Post 
          key={post.id}
          post={post}
          onComment={() => onComment(post.id)}
          onLike={() => onLike(post.id)} 
          onHeaderClick={onHeaderClick}
          liked={post.liked}
        />
      ))}
    </div>
  );
};

export default PostList;
