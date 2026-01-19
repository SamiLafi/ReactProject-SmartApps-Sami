// src/utils/postActions.js
import { doc, getDoc, updateDoc, increment, arrayRemove, arrayUnion } from 'firebase/firestore';
import { auth } from '../services/firebaseConfig';
import { getFirestore } from 'firebase/firestore';

const db = getFirestore();

export const handleLikePost = async (postId, setPosts) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const postRef = doc(db, "posts", postId);
    const postDoc = await getDoc(postRef);

    if (postDoc.exists()) {
      const postData = postDoc.data();
      const userId = currentUser.uid;

      const likedBy = postData.likedBy || [];
      const isLiked = likedBy.includes(userId);

      const updates = {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
      };

      await updateDoc(postRef, updates);

      const updatedPostDoc = await getDoc(postRef);
      if (updatedPostDoc.exists()) {
        const updatedPostData = updatedPostDoc.data();

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: updatedPostData.likes,
                  likedBy: updatedPostData.likedBy,
                }
              : post
          )
        );
      }
    }
  }
};
