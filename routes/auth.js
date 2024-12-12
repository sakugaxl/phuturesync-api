// Import required modules
const express = require("express");
const axios = require("axios");
const { doc, setDoc, getDoc } = require("firebase/firestore");
const { getFirestoreDb } = require("../utils/firebase");

const router = express.Router();
const firestoreDb = getFirestoreDb();

// Helper to exchange short-lived token for long-lived token
async function exchangeForLongLivedToken(accessToken, appId, appSecret) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v21.0/oauth/access_token`,
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: accessToken,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error exchanging for long-lived token:", error.response?.data || error.message);
    throw error;
  }
}

// Facebook OAuth Start Route
router.get("/facebook", (req, res) => {
  const { FACEBOOK_APP_ID, FACEBOOK_REDIRECT_URI } = process.env;
  const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${FACEBOOK_REDIRECT_URI}&scope=email,read_insights,pages_show_list,ads_management,ads_read,business_management,instagram_basic,instagram_manage_insights,instagram_content_publish,whatsapp_business_management,instagram_manage_messages,pages_read_engagement,pages_manage_metadata,pages_read_user_content,pages_manage_ads,pages_manage_posts,whatsapp_business_messaging`;
  res.redirect(authUrl);
});

// Facebook OAuth Callback Route
router.get("/facebook/callback", async (req, res) => {
  const { code } = req.query;
  const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_REDIRECT_URI, FRONTEND_URL } = process.env;

  try {
    // Step 1: Exchange code for a short-lived token
    const tokenResponse = await axios.get(
      `https://graph.facebook.com/v21.0/oauth/access_token`,
      {
        params: {
          client_id: FACEBOOK_APP_ID,
          client_secret: FACEBOOK_APP_SECRET,
          redirect_uri: FACEBOOK_REDIRECT_URI,
          code,
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Step 2: Exchange for a long-lived token
    const longLivedToken = await exchangeForLongLivedToken(
      access_token,
      FACEBOOK_APP_ID,
      FACEBOOK_APP_SECRET
    );

    // Step 3: Fetch connected accounts
    const accountsResponse = await axios.get(
      `https://graph.facebook.com/v21.0/me/accounts`,
      {
        headers: { Authorization: `Bearer ${longLivedToken}` },
      }
    );
    const accounts = accountsResponse.data.data;

    // Step 4: Save data to Firestore
    const userId = req.query.userId || "testUserId";
    const userRef = doc(firestoreDb, "users", userId);
    await setDoc(
      userRef,
      {
        socialAccounts: {
          facebook: {
            connected: true,
            accessToken: longLivedToken,
            accounts,
          },
        },
      },
      { merge: true }
    );

    res.redirect(`${FRONTEND_URL}/auth-success?platform=facebook`);
  } catch (error) {
    console.error("Error during Facebook callback:", error.response?.data || error.message);
    res.redirect(`${FRONTEND_URL}/auth-failure?platform=facebook&message=${encodeURIComponent(error.message)}`);
  }
});

// Check Facebook Connection Status
router.get("/facebook/status", async (req, res) => {
  try {
    const userId = req.query.userId || "testUserId";
    const userRef = doc(firestoreDb, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const facebookAccount = userDoc.data()?.socialAccounts?.facebook;
      res.json({ isConnected: !!facebookAccount?.connected });
    } else {
      res.json({ isConnected: false });
    }
  } catch (error) {
    console.error("Error checking Facebook connection status:", error.message);
    res.status(500).json({ error: "Failed to check connection status" });
  }
});

module.exports = router;
