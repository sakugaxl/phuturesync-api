// utils/firebaseAdmin.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const decodedKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf-8');
  
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: decodedKey,
    }),
  });
}

const db = admin.firestore();
module.exports = { db };
