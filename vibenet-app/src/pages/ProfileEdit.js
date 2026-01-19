import React, { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

import { auth } from '../services/firebaseConfig';
import '../styles/ProfileEdit.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserProvider';

const db = getFirestore();

const ProfileEdit = () => {
    const { user, setUser } = useUser();
    const [username, setUsername] = useState("");
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [bio, setBio] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");
    const [previewPhoto, setPreviewPhoto] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
          setUsername(user.username);
          setFirstName(user.firstName);
          setLastName(user.lastName);
          setBio(user.bio);
          setProfilePhoto(user.profilePic);
          setPreviewPhoto(user.profilePic);
        }
      }, [user]); // Update state when user context changes

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "firstName") setFirstName(value);
        if (name === "lastName") setLastName(value);
        if (name === "bio") setBio(value);
    };

    const handleSave = async () => {
      try {
          const currentUser = auth.currentUser;
          if (currentUser) {
              // Gebruik previewPhoto als de nieuwe profielfoto
              const userUpdateData = {
                  firstName: firstname,
                  lastName: lastname,
                  bio: bio,
                  profilePic: previewPhoto || profilePhoto, // Val terug op huidige profilePhoto als previewPhoto leeg is
              };
  
              // Update Firestore-gebruiker
              await updateDoc(doc(db, 'users', currentUser.uid), userUpdateData);
  
              setUser({
                  ...user,
                  firstName: firstname,
                  lastName: lastname,
                  bio: bio,
                  profilePic: previewPhoto || profilePhoto,
              });
  
              // Update de posts en reacties van de gebruiker
              const postsQuery = query(
                  collection(db, 'posts'),
                  where('posts_userId', '==', currentUser.uid)
              );
              const postsSnapshot = await getDocs(postsQuery);
  
              postsSnapshot.forEach(async (postDoc) => {
                  await updateDoc(postDoc.ref, {
                      posts_firstName: firstname,
                      posts_lastName: lastname,
                      posts_profilePic: previewPhoto || profilePhoto,
                  });
  
                  const commentsCollectionRef = collection(db, 'posts', postDoc.id, 'comments');
                  const commentsQuery = query(commentsCollectionRef, where('userId', '==', currentUser.uid));
                  const commentsSnapshot = await getDocs(commentsQuery);
  
                  commentsSnapshot.forEach(async (commentDoc) => {
                      await updateDoc(commentDoc.ref, {
                          comment_firstName: firstname,
                          comment_lastName: lastname,
                          comment_profilePic: previewPhoto || profilePhoto,
                      });
                  });
              });
  
              alert("Profiel succesvol bijgewerkt!");
              navigate(`/profile/${currentUser.uid}`);
          }
      } catch (error) {
          console.error("Error updating profile:", error);
      }
  };    

    const handleCancel = () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            navigate(`/profile/${currentUser.uid}`); // Navigate to the user's profile
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewPhoto(reader.result);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };


    const handleRemovePhoto = async () => {
        const storage = getStorage();
        const placeholderRef = ref(storage, "images/150.png");
    
        try {
            const url = await getDownloadURL(placeholderRef);
            setPreviewPhoto(url);
        } catch (error) {
            console.error("Error fetching placeholder image URL:", error);
        }
    };
    

    return (
      <div className="profile-edit-container">
        <div className="profile-edit-header">
            <img src={profilePhoto} alt="Profielfoto" className="profile-photo" />
            <div className="profile-edit-info">
                <input
                    type="text"
                    className="edit-input username-input"
                    placeholder={username}
                    disabled
                />
                <div className="name-container">
                    <input
                        type="text"
                        className="edit-input first-name-input"
                        name="firstName"
                        value={firstname}
                        onChange={handleInputChange}
                        placeholder="Nieuwe voornaam"
                    />
                    <input
                        type="text"
                        className="edit-input last-name-input"
                        name="lastName"
                        value={lastname}
                        onChange={handleInputChange}
                        placeholder="Nieuwe achternaam"
                    />
                </div>
                <textarea
                    className="edit-textarea"
                    name="bio"
                    value={bio}
                    onChange={handleInputChange}
                    placeholder="Nieuwe bio"
                ></textarea>
                <div className="photo-container">
                    {profilePhoto && (
                        <img
                            src={previewPhoto}
                            alt="Nieuwe profielfoto"
                            className="preview-photo"
                        />
                    )}
                    <input
                        type="file"
                        className="edit-photo-input"
                        accept="image/*"
                        onChange={handlePhotoChange}
                    />
                </div>
                <div className="edit-buttons">
                    <button className="save-button" onClick={handleSave}>Opslaan</button>
                    <button className="cancel-button" onClick={handleCancel}>Annuleren</button>
                    <button className="remove-photo-button" onClick={handleRemovePhoto}>
                        Verwijder Profielfoto
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
};

export default ProfileEdit;