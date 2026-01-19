import React from 'react';


const PostList = ({ userPosts, selectedTab, isCurrentUserProfile, setUserPosts, toggleEditPost, handleDeletePost, editingPostId, setEditingPostId, editBio, setEditBio, handleUpdatePost }) => {

    return (
    <div className="posts-wrapper">
      {userPosts
        .filter(post => selectedTab === "all" || post.posts_type === selectedTab)
        .map((item) => (
          <div key={item.id} className="post">
            <div className="post-header">
              <img
                className="post-profile-pic"
                src={item.posts_profilePic || "https://via.placeholder.com/50"} // Assuming profilePic is part of the post item
                alt="Profile pic"
              />
              <div className="post-user-info">
                <p className="post-username">{item.posts_firstName} {item.posts_lastName}</p>
                <p className="post-handle">@{item.posts_userName}</p>
              </div>
              {isCurrentUserProfile && (
                <div className="post-menu">
                  <button
                    className="menu-button"
                    onClick={() =>
                      setUserPosts(prevPosts => prevPosts.map((post) =>
                        post.id === item.id
                          ? { ...post, showMenu: !post.showMenu }
                          : post
                      ))
                    }
                  >
                    &#x22EE;
                  </button>
                  {item.showMenu && (
                    <div className="dropdown-menu">
                      <button
                        className="dropdown-item"
                        onClick={() => toggleEditPost(item.id, item.posts_bio)}
                      >
                        Edit
                      </button>

                      <button
                        className="dropdown-item"
                        onClick={() => handleDeletePost(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {editingPostId === item.id ? (
              <div className="edit-post-form">
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="edit-bio-input"
                />
                <button onClick={() => handleUpdatePost(item.id)}>Save</button>
                <button onClick={() => setEditingPostId(null)}>Cancel</button>
              </div>
            ) : (
              <p className="post-description">{item.posts_bio}</p>
            )}
            {item.posts_edited && ( // Conditionally render "(edited)"
              <span className="post-edited"> (edited)</span>
            )}

            {item.posts_type === 'post' && item.imageUrl && (
              <div className="post-pic">
                <img src={item.imageUrl} alt="Post content" />
              </div>
            )}
            <div className="post-actions">
              <button className="like-button">
                ❤️ Like {item.likes}
              </button>
              <button className="comment-button">
                💬 Comment {item.comments || 0}
              </button>
            </div>
          </div>
        ))
      }
    </div>
  );
};

export default PostList;
