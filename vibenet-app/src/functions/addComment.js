import React from 'react';

const addComment = ({ commentInput, setCommentInput, handleAddComment }) => (
  <div className="add-comment">
    <input
      type="text"
      value={commentInput}
      onChange={(e) => setCommentInput(e.target.value)}
      placeholder="Add a comment"
      className="comment-input"
    />
    <button onClick={handleAddComment} className="post-comment-button">Post Comment</button>
  </div>
);

export default addComment;
