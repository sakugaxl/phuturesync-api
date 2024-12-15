require('dotenv').config();
const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log("✅ Firebase Admin initialized using Application Default Credentials.");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error.message);
    throw new Error("Failed to initialize Firebase Admin.");
  }
} else {
  console.log("ℹ️ Firebase Admin is already initialized.");
}

const db = admin.firestore();
module.exports = { db };
