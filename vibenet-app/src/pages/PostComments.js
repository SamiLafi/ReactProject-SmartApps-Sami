import React, { useState, useEffect } from 'react';
import { getFirestore, doc as firestoreDoc, getDoc, collection, addDoc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import '../styles/PostComments.css';

import CommentsList from '../components/CommentsList';
import AddComment from '../functions/addComment';
import PostComment from '../components/PostComment';

const PostComments = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    const db = getFirestore();

    const fetchPost = async () => {
      const postDoc = await getDoc(firestoreDoc(db, 'posts', postId));
      if (postDoc.exists()) {
        const postData = postDoc.data();
        const userDoc = await getDoc(firestoreDoc(db, 'users', postData.posts_userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPost({
            ...postData,
            posts_firstname: userData.firstName,
            posts_lastname: userData.lastName,
            posts_username: userData.username,
            posts_profilepic: userData.profilePic
          });
        }
      }
    };

    const commentsCollectionRef = collection(db, 'posts', postId, 'comments');
    const unsubscribe = onSnapshot(commentsCollectionRef, async (snapshot) => {
      const commentList = await Promise.all(snapshot.docs.map(async (commentDoc) => {
        const commentData = { id: commentDoc.id, ...commentDoc.data() };
        const userDocRef = firestoreDoc(db, 'users', commentData.userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          return { ...commentData, username: userData.username };
        }
        return commentData;
      }));

      setComments(commentList);
    });

    fetchPost();

    return () => unsubscribe();
  }, [postId]);

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
  
    const db = getFirestore();
    const currentUser = auth.currentUser;
  
    if (currentUser) {
      try {
        // Fetch user details from Firestore
        const userDocRef = firestoreDoc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();  // Retrieve the user data
  
          // Check if profilePic URL is available
          const profilePicUrl = userData.profilePic || "https://via.placeholder.com/50"; // Default to empty string if not set
  
          const newComment = {
            userId: currentUser.uid,
            comment_firstName: userData.firstName,
            comment_lastName: userData.lastName,
            comment_profilePic: profilePicUrl, // Include profilePic URL
            commentText: commentInput,
            createdAt: new Date(),
          };
  
          // Add the new comment to the 'comments' collection in Firestore
          await addDoc(collection(db, 'posts', postId, 'comments'), newComment);
          setCommentInput("");  // Clear the input field after successful addition
        } else {
          console.error("User data not found");
        }
      } catch (error) {
        console.error("Error adding comment: ", error);
      }
    }
  };
  
  

return (
    <div className="post-comments-container">
      {post ? (
        <>
          <PostComment post={post} />
          <CommentsList comments={comments} postId={postId} />
          <AddComment 
            commentInput={commentInput} 
            setCommentInput={setCommentInput} 
            handleAddComment={handleAddComment} 
          />
        </>
      ) : (
        <p>Loading post...</p>
      )}
    </div>
  );
};

export default PostComments;
