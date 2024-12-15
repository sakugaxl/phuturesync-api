const express = require("express");
const axios = require("axios");
const { db } = require("../utils/firebaseAdmin");

const router = express.Router();

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
    console.error("❌ Error exchanging for long-lived token:", error.response?.data || error.message);
    throw error;
  }
}

// Facebook OAuth Start Route
router.get("/facebook", (req, res) => {
  const { FACEBOOK_APP_ID, FACEBOOK_REDIRECT_URI } = process.env;

  if (!FACEBOOK_APP_ID || !FACEBOOK_REDIRECT_URI) {
    console.error("❌ Missing FACEBOOK_APP_ID or FACEBOOK_REDIRECT_URI in env");
    return res.status(500).json({ error: "Missing environment variables for Facebook OAuth" });
  }

  const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${FACEBOOK_REDIRECT_URI}&scope=email,read_insights,pages_show_list,ads_management,ads_read,business_management,instagram_basic,instagram_manage_insights,instagram_content_publish,whatsapp_business_management,instagram_manage_messages,pages_read_engagement,pages_manage_metadata,pages_read_user_content,pages_manage_ads,pages_manage_posts,whatsapp_business_messaging`;
  res.redirect(authUrl);
});

// Facebook OAuth Callback Route
router.get("/facebook/callback", async (req, res) => {
  const { code, state } = req.query;
  const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_REDIRECT_URI, FRONTEND_URL } = process.env;

  if (!code) {
    console.error("❌ Missing 'code' query parameter in callback request");
    return res.redirect(`${FRONTEND_URL}/auth-failure?platform=facebook&message=Missing%20code%20parameter`);
  }

  if (!FRONTEND_URL) {
    console.error("❌ Missing FRONTEND_URL in env");
    return res.status(500).json({ error: "Missing FRONTEND_URL in environment variables" });
  }

  try {
    console.log("ℹ️ Exchanging code for access token...");
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

    console.log("ℹ️ Exchanging for long-lived token...");
    const longLivedToken = await exchangeForLongLivedToken(access_token, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET);

    console.log("ℹ️ Fetching user accounts...");
    const accountsResponse = await axios.get(
      `https://graph.facebook.com/v21.0/me/accounts`,
      {
        headers: {
          Authorization: `Bearer ${longLivedToken}`,
        },
      }
    );

    const accounts = accountsResponse.data.data;
    const userId = state || "testUserId"; // Use state from the query if available

    console.log(`ℹ️ Saving to Firestore for userId: ${userId}...`);
    const userRef = db.collection("users").doc(userId);
    await userRef.set(
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

    console.log("✅ Data saved successfully!");

    res.redirect(`${FRONTEND_URL}/auth-success?platform=facebook`);
  } catch (error) {
    console.error("❌ Error during Facebook callback:", error.message);
    res.redirect(
      `${FRONTEND_URL}/auth-failure?platform=facebook&message=${encodeURIComponent(error.message)}`
    );
  }
});

module.exports = router;
