import React, { useState } from 'react';
import { addDoc, collection, Timestamp, getFirestore } from 'firebase/firestore';
import { auth, storage } from '../../services/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import '../../styles/PostInput.css';
import { useUser } from '../../contexts/UserProvider'; // Import the useUser hook

const db = getFirestore();

const PostInput = ({ onPostCreated }) => {
  const { user } = useUser(); // Access user data from context
  const [vibeInput, setVibeInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  const extractHashtags = (text) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = [...text.matchAll(hashtagRegex)];
    return matches.map((match) => match[1].toLowerCase()); // Return hashtags in lowercase
  };

  const handleImageUpload = async (file) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `images/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null, // Optional progress handler
        (error) => {
          console.error('Image upload failed:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            console.error('Failed to get download URL:', error);
            reject(error);
          }
        }
      );
    });
  };

  const handlePost = async () => {
    const currentUser = auth.currentUser;
    if (!vibeInput.trim() || !currentUser) return;

    setLoading(true); // Set loading to true when post starts

    const postType = imageFile ? 'post' : 'vibe';
    let imageUrl = '';
    const posts_hashtags = extractHashtags(vibeInput); // Extract hashtags from text

    if (imageFile) {
      try {
        imageUrl = await handleImageUpload(imageFile);
      } catch (error) {
        console.error('Error uploading image:', error);
        setLoading(false); // Reset loading on error
        return;
      }
    }


    const newPost = {
      posts_bio: vibeInput,
      posts_userId: currentUser.uid,
      posts_firstName: user?.firstName || '',
      posts_lastName: user?.lastName || '',
      posts_userName: user?.username || '',
      posts_profilePic: user?.profilePic || '',
      posts_edited: false,
      posts_type: postType,
      createdAt: Timestamp.now(),
      likes: 0,
      likedBy: [],
      posts_hashtags,
      ...(imageFile && { imageUrl }),
    };

    try {
      const docRef = await addDoc(collection(db, 'posts'), newPost);

      const savedPost = {
        ...newPost,
        id: docRef.id, // Include the Firestore-generated ID
      };

      setVibeInput('');
      setImageFile(null);
      setImagePreview(null);

      if (onPostCreated) {
        onPostCreated(savedPost);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false); // Reset loading after post is created
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Generate a temporary URL for preview
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  if (!user) return <div>Loading...</div>; // Ensure user data is loaded from context before rendering

  return (
    <div className="post-input-container">
      <div className="input-profile-pic">
        <img src={user.profilePic || '/default-profile.png'} alt="Profile" />
      </div>
      <div className="input-wrapper">
        <div className="vibe-input">
          <input
            type="text"
            placeholder="Share a vibe..."
            value={vibeInput}
            onChange={(e) => setVibeInput(e.target.value)}
          />
          <button onClick={handlePost} disabled={loading}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
        <div className="post-input">
          <label className="image-uploader-label">
            {imagePreview ? 'Change Image' : 'Upload Image'}
            <input
              className="image-uploader"
              type="file"
              onChange={handleImageSelect}
            />
          </label>
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Selected" />
              <button className="remove-image-btn" onClick={handleImageRemove}>
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostInput;
