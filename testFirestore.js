require("dotenv").config(); // Load environment variables

const admin = require("firebase-admin");

// Check if Firebase app has already been initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

async function testFirestore() {
  try {
    console.log("🔥 Attempting to write to Firestore...");
    const testRef = db.collection("users").doc("testUserId");
    await testRef.set({ testField: "testValue" });
    console.log("✅ Firestore write successful!");

    // Read the document back
    console.log("📚 Reading the Firestore document...");
    const docSnap = await testRef.get();
    if (docSnap.exists) {
      console.log("📘 Document Data:", docSnap.data());
    } else {
      console.log("❌ No document found!");
    }

  } catch (error) {
    console.error("❗ Firestore write/read failed:", error.message);
  }
}

testFirestore();
