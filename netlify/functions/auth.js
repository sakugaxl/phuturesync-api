const axios = require("axios");
const { db } = require("../../utils/firebase");

// Helper: Exchange Facebook token for long-lived token
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
    console.error("Failed to exchange Facebook token:", error.message);
    throw error;
  }
}

exports.handler = async (event) => {
  try {
    const { path, queryStringParameters } = event;

    // Facebook Auth URL
    if (path === "/functions/auth/facebook") {
      const { FACEBOOK_APP_ID, FACEBOOK_REDIRECT_URI } = process.env;
      const authUrl = `https://www.facebook.com/v14.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${FACEBOOK_REDIRECT_URI}&scope=pages_manage_ads,pages_read_engagement`;
      return {
        statusCode: 302,
        headers: { Location: authUrl },
        body: "",
      };
    }

    // Handle Facebook Callback
    if (path === "/functions/auth/facebook/callback") {
      const { code } = queryStringParameters;
      const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_REDIRECT_URI } = process.env;

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
      const longLivedToken = await exchangeForLongLivedToken(
        access_token,
        FACEBOOK_APP_ID,
        FACEBOOK_APP_SECRET
      );

      // Save token in database
      await db.collection("users").doc("userId").set({
        socialAccounts: {
          facebook: {
            connected: true,
            accessToken: longLivedToken,
          },
        },
      });

      return {
        statusCode: 302,
        headers: { Location: "https://phuturesync.co.za/auth-success" },
        body: "",
      };
    }

    // Instagram Auth URL
    if (path === "/functions/auth/instagram") {
      const { INSTAGRAM_APP_ID, INSTAGRAM_REDIRECT_URI } = process.env;
      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;
      return {
        statusCode: 302,
        headers: { Location: authUrl },
        body: "",
      };
    }

    // Handle Instagram Callback
    if (path === "/functions/auth/instagram/callback") {
      const { code } = queryStringParameters;
      const { INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_REDIRECT_URI } = process.env;

      const tokenResponse = await axios.post(
        `https://api.instagram.com/oauth/access_token`,
        {
          client_id: INSTAGRAM_APP_ID,
          client_secret: INSTAGRAM_APP_SECRET,
          grant_type: "authorization_code",
          redirect_uri: INSTAGRAM_REDIRECT_URI,
          code,
        }
      );

      const { access_token, user_id } = tokenResponse.data;

      await db.collection("users").doc("userId").set({
        socialAccounts: {
          instagram: { connected: true, accessToken: access_token, userId: user_id },
        },
      });

      return {
        statusCode: 302,
        headers: { Location: "https://phuturesync.co.za/auth-success" },
        body: "",
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Not Found" }),
    };
  } catch (error) {
    console.error("Error in handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
