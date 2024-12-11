const admin = require("firebase-admin");

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY is missing.");
  process.exit(1);
}

let serviceAccount;

try {
  // Replace escaped newlines with actual newlines
  const formattedKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, "\n");
  serviceAccount = JSON.parse(formattedKey);
} catch (error) {
  console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:", error);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
module.exports = { db };
