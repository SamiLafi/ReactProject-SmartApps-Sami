import React from 'react';
import Comment from './Comment';

const CommentsList = ({ comments, postId }) => (
  <div className="comments-section">
    <h3>Comments</h3>
    {comments.length > 0 ? (
      comments.map(comment => (
        <Comment key={comment.id} comment={{ ...comment, postId }} />
      ))
    ) : (
      <p>No comments yet</p>
    )}
  </div>
);

export default CommentsList;
