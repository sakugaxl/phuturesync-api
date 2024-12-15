// utils/firebaseAdmin.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;

  if (!base64Key) {
    console.error("❌ Missing FIREBASE_PRIVATE_KEY_BASE64 environment variable.");
    throw new Error("FIREBASE_PRIVATE_KEY_BASE64 is not set in the environment.");
  }

  const decodedKey = Buffer.from(base64Key, 'base64').toString('utf-8');

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
