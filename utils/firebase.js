// Import necessary Firebase modules
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, collection, getDocs, query, where } = require("firebase/firestore");
const { errorHandler } = require("./helpers");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

let app;
let firestoreDb;

// Initialize Firebase
const initializeFirebaseApp = () => {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      firestoreDb = getFirestore();
    }
  } catch (error) {
    errorHandler(error, "firebase-initializeFirebaseApp");
  }
};

const getFirebaseApp = () => app;
const getFirestoreDb = () => firestoreDb;

module.exports = {
  initializeFirebaseApp,
  getFirebaseApp,
  getFirestoreDb,
};
