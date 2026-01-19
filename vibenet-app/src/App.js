import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { requestNotificationPermission, onMessageListener, registerServiceWorker } from './services/firebaseConfig';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PasswordReset from './pages/PasswordReset';
import PostComments from './pages/PostComments';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import Layout from './layout/Layout';
import Messages from './pages/Messages';
import Explore from './pages/Explore';
import { PostFetchProvider } from './contexts/PostFetchProvider';
import { UserProvider } from './contexts/UserProvider';
import Story from './pages/Story';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initNotifications = async () => {
      try {
        await registerServiceWorker();
        
        await requestNotificationPermission();

        onMessageListener()
          .then((payload) => {
            console.log('New message received:', payload);
            if (payload.notification) {
              const { title, body } = payload.notification;
              new Notification(title || 'Notification', { body: body || 'You have a new message' });
            }
          })
          .catch((error) => {
            console.error('Error receiving messages:', error);
          });
      } catch (error) {
        console.error('Error initializing notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    initNotifications();
  }, []);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="App">
      <UserProvider>
        <PostFetchProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<PasswordReset />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/story" element={<Story />} />
                <Route path="/profile-edit" element={<ProfileEdit />} />
                <Route path="/post/:postId" element={<PostComments />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/messages/:userId" element={<Messages />} />
                <Route path="/explore" element={<Explore />} />
              </Routes>
            </Layout>
          </Router>
        </PostFetchProvider>
      </UserProvider>
    </div>
  );
}

export default App;
