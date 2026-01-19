import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCgsXkA6x4M4Eue-Ynn_1Oe2fMEsqS3t4I',
  authDomain: 'vibenet-app.firebaseapp.com',
  projectId: 'vibenet-app',
  storageBucket: 'vibenet-app.appspot.com',
  messagingSenderId: '208427323855',
  appId: '1:208427323855:web:f60d704c893b05e688c2ba',
  measurementId: 'G-ZF0R88L10R',
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);
const firestore = getFirestore(app);

const getFCMToken = async (userId) => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey:
        'BIknXp9P9qLeDRWj4nuG3CgSq7BaAu3cGCt0amSe_Fsu3X6rxLNCsOvBGON-q-u4UeL9ARXhbpLdhnCBevEuHKs',
    });

    if (currentToken) {
      console.log('Token FCM:', currentToken);
      // Save the token to Firestore
      await setDoc(
        doc(firestore, 'users', userId),
        {
          fcmToken: currentToken,
        },
        { merge: true }
      );
    } else {
      console.log('Geen FCM-token. De gebruiker heeft geen meldingen toegestaan.');
    }
  } catch (error) {
    console.error('Fout bij ophalen van FCM-token:', error);
  }
};

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Machtigingen voor meldingen verleend.');
      const userId = auth.currentUser ? auth.currentUser.uid : 'gast';
      await getFCMToken(userId);
    } else {
      console.error('Geen toestemming voor meldingen.');
      alert('U moet meldingen toestaan.');
    }
  } catch (error) {
    console.error('Fout bij het aanvragen van meldingsrechten:', error);
  }
};

export const onMessageListener = () => {
  return new Promise((resolve, reject) => {
    onMessage(messaging, (payload) => {
      console.log('Nieuw bericht:', payload);
      resolve(payload);
    });
  });
};

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js'
      );
      console.log('Service worker registered:', registration);
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          await requestNotificationPermission();
        } else {
          console.log('User is not logged in, skipping token retrieval.');
        }
      });
    } catch (error) {
      console.error('Fout bij het registreren van service worker:', error);
    }
  }
};

if (process.env.NODE_ENV !== 'development') {
  registerServiceWorker();
}

export { auth, googleProvider, storage, firebaseConfig };
