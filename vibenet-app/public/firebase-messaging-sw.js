/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

// Import Firebase libraries using importScripts
importScripts('https://www.gstatic.com/firebasejs/9.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.10.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgsXkA6x4M4Eue-Ynn_1Oe2fMEsqS3t4I",
  authDomain: "vibenet-app.firebaseapp.com",
  projectId: "vibenet-app",
  storageBucket: "vibenet-app.appspot.com",
  messagingSenderId: "208427323855",
  appId: "1:208427323855:web:f60d704c893b05e688c2ba",
  measurementId: "G-ZF0R88L10R"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title || 'Default Title';
  const notificationOptions = {
    body: payload.notification.body || 'Default Body',
    icon: payload.notification.icon || '/firebase-logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});