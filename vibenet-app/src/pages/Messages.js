import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  orderBy,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth } from '../services/firebaseConfig';
import '../styles/Messages.css';

const db = getFirestore();

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userIdToChat = location.state?.userId || null;
  const currentUser = auth.currentUser;

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [usernames, setUsernames] = useState({}); // Cache voor gebruikersnamen

  // Abonnement op real-time berichten
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else {
      loadConversations(currentUser.uid);
    }
  }, [navigate, currentUser]);

  const loadConversations = async (userId) => {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('Geen gesprekken gevonden.');
    } else {
      const conversationsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Haal gebruikersnamen op voor alle deelnemers
      const participants = conversationsList.flatMap(
        (conv) => conv.participants
      );
      await fetchUsernames(participants);

      setConversations(conversationsList);
    }
  };

  const fetchUsernames = async (userIds) => {
    const uniqueIds = [...new Set(userIds)]; // Zorg dat IDs uniek zijn
    const usernamesRef = collection(db, 'users');
    const q = query(usernamesRef, where('__name__', 'in', uniqueIds));

    try {
      const querySnapshot = await getDocs(q);
      const usernamesMap = {};
      querySnapshot.forEach((doc) => {
        usernamesMap[doc.id] = doc.data().username;
      });

      setUsernames((prev) => ({ ...prev, ...usernamesMap }));
    } catch (error) {
      console.error('Error ophalen gebruikersnamen:', error);
    }
  };

  const createConversation = async (userId1, userId2) => {
    const conversationsRef = collection(db, 'conversations');

    const conversationData = {
      participants: [userId1, userId2],
      lastMessage: '',
      timestamp: new Date(),
    };

    try {
      const docRef = await addDoc(conversationsRef, conversationData);
      loadConversations(userId1);
      return docRef.id;
    } catch (error) {
      console.error('Error aanmaken conversation:', error);
      return null;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() !== '') {
      if (!selectedConversation) {
        const otherUser = userIdToChat;
        const conversationId = await createConversation(
          currentUser.uid,
          otherUser
        );
        if (conversationId) {
          setSelectedConversation(conversationId);
        } else {
          console.error('Fout bij aanmaken van conversation.');
          return;
        }
      }

      if (!selectedConversation) {
        console.error('Geen conversation geselecteerd');
        return;
      }

      const messageData = {
        sender: currentUser.uid,
        content: newMessage,
        timestamp: new Date(),
      };

      const conversationRef = doc(db, 'conversations', selectedConversation);
      const messagesRef = collection(conversationRef, 'messages');

      await addDoc(messagesRef, messageData);

      const conversationDocRef = doc(db, 'conversations', selectedConversation);
      await setDoc(
        conversationDocRef,
        { lastMessage: newMessage, timestamp: new Date() },
        { merge: true }
      );

      setNewMessage('');
    }
  };

  const subscribeToMessages = (conversationId) => {
    const conversationRef = doc(db, 'conversations', conversationId);
    const messagesRef = collection(conversationRef, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesList);
    });

    return unsubscribe; // Zorg ervoor dat we later kunnen ontkoppelen
  };

  useEffect(() => {
    let unsubscribe = null;
    if (selectedConversation) {
      unsubscribe = subscribeToMessages(selectedConversation);
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedConversation]);

  const getOtherParticipant = (participants) => {
    return participants.find((participant) => participant !== currentUser.uid);
  };

  const getUsername = (userId) => {
    return usernames[userId] || userId;
  };

  const handleConversationClick = (conversationId) => {
    setSelectedConversation(conversationId);
  };

  return (
    <div className='messages-container'>
      <div className='conversations-list'>
        <h3>Berichten</h3>
        {conversations.length === 0 ? (
          <p>Geen conversations gevonden</p>
        ) : (
          conversations.map((conv) => {
            const otherParticipant = getOtherParticipant(conv.participants);
            return (
              <div
                key={conv.id}
                className={`conversation-item ${
                  selectedConversation === conv.id ? 'active' : ''
                }`}
                onClick={() => handleConversationClick(conv.id)}
              >
                Chat met {getUsername(otherParticipant)}
              </div>
            );
          })
        )}
      </div>

      <div className='chatbox'>
        <h2>
          {selectedConversation
            ? `Chat met ${getUsername(
                getOtherParticipant(
                  conversations.find((conv) => conv.id === selectedConversation)
                    ?.participants || []
                )
              )}`
            : 'Selecteer een gesprek'}
        </h2>
        <div className='messages-list'>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.sender === currentUser.uid ? 'sent' : 'received'
              }`}
            >
              <p>{msg.content}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className='message-input'>
          <input
            type='text'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder='Type een bericht...'
            required
          />
          <button type='submit'>Verzenden</button>
        </form>
      </div>
    </div>
  );
};

export default Messages;
