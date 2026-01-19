const admin = require('firebase-admin');
const readline = require('readline');

const serviceAccount = require('C:\\GitHub\\ReactProject-SmartApps-2425\\vibenet-app\\vibenet-app-firebase-adminsdk-f0q4v-ab5888098d.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const sendNotificationToUser = async (userId) => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log(`No document found for user ID: ${userId}`);
      return;
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      console.log(`No FCM token found for user ID: ${userId}`);
      return;
    }

    const message = {
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification.',
      },
      token: fcmToken, 
    };

    const response = await admin.messaging().send(message);
    console.log('Notification successfully sent:', response);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the user ID: ', (userId) => {
  sendNotificationToUser(userId).then(() => rl.close());
});
