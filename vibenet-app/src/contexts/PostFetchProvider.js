import { createContext, useContext, useState } from 'react';
import { getFirestore, doc, collection, getDocs, deleteDoc } from 'firebase/firestore';

const PostFetchContext = createContext();

export const PostFetchProvider = ({ children }) => {
  const [posts, setPosts] = useState([]); // Store posts here
  const [userPosts, setUserPosts] = useState([]); // Store posts here
  const [hasUserFetchedPosts, setUserHasFetchedPosts] = useState(false); // Avoid redundant fetch calls
  const [hasFetchedPosts, setHasFetchedPosts] = useState(false); // Avoid redundant fetch calls
  const db = getFirestore();

  // Functie voor het verwijderen van een post
  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    const postRef = doc(db, 'posts', postId);
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const likesRef = collection(db, 'posts', postId, 'likes');

    const deleteCollection = async (collectionRef) => {
        const snapshot = await getDocs(collectionRef);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
    };

    try {
        await deleteCollection(commentsRef);
        await deleteCollection(likesRef);
        await deleteDoc(postRef);

        // Update de posts state
        setUserPosts(userPosts.filter(post => post.id !== postId));
    } catch (error) {
        console.error("Error deleting post and associated data:", error);
        alert("Failed to delete the post. Please try again.");
    }
  };

  return (
    <PostFetchContext.Provider value={{ posts, setPosts, userPosts, setUserPosts, hasFetchedPosts, setHasFetchedPosts, hasUserFetchedPosts, setUserHasFetchedPosts, handleDeletePost }}>
      {children}
    </PostFetchContext.Provider>
  );
};

// Custom hook to use the PostFetch context
export const usePostFetch = () => useContext(PostFetchContext);
