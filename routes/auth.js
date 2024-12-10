const express = require("express");
const axios = require("axios");
const router = express.Router();
const { db } = require("../utils/firebase");

// Helper to handle long-lived tokens for Facebook
async function exchangeForLongLivedToken(accessToken, appId, appSecret) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v14.0/oauth/access_token`,
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

// Facebook OAuth Routes
router.get("/facebook", (req, res) => {
  const { FACEBOOK_APP_ID, FACEBOOK_REDIRECT_URI } = process.env;
  const authUrl = `https://www.facebook.com/v14.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${FACEBOOK_REDIRECT_URI}&scope=pages_manage_ads,pages_manage_metadata,pages_read_engagement,pages_read_user_content,ads_read`;
  res.redirect(authUrl);
});

router.get("/facebook/callback", async (req, res) => {
  const { code } = req.query;
  const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_REDIRECT_URI, FRONTEND_URL } = process.env;

  try {
    // Step 1: Exchange code for short-lived access token
    const tokenResponse = await axios.get(
      `https://graph.facebook.com/v14.0/oauth/access_token`,
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

    // Step 2: Exchange short-lived token for long-lived token
    const longLivedToken = await exchangeForLongLivedToken(
      access_token,
      FACEBOOK_APP_ID,
      FACEBOOK_APP_SECRET
    );

    // Step 3: Fetch user accounts associated with the access token
    const accountsResponse = await axios.get(
      `https://graph.facebook.com/v14.0/me/accounts`,
      {
        headers: {
          Authorization: `Bearer ${longLivedToken}`,
        },
      }
    );

    const accounts = accountsResponse.data.data;
    const userId = req.query.userId || "testUserId";

    // Step 4: Save token and accounts to Firebase
    await db.collection("users").doc(userId).set(
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
    console.error("Error connecting to Facebook:", error.response?.data || error.message);
    res.redirect(
      `${FRONTEND_URL}/auth-failure?platform=facebook&message=${encodeURIComponent(
        error.message
      )}`
    );
  }
});

// Check connection status
router.get("/facebook/status", async (req, res) => {
  try {
    const userId = req.query.userId || "testUserId";
    const userDoc = await db.collection("users").doc(userId).get();

    if (userDoc.exists) {
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
