const express = require('express');
const { db } = require('../utils/firebase'); // Firestore database instance
const instagramClient = require('../utils/apiClients/instagram'); // Instagram API client
const facebookClient = require('../utils/apiClients/facebook'); // Facebook API client
const twitterClient = require('../utils/apiClients/twitter'); // Twitter API client
const linkedinClient = require('../utils/apiClients/linkedin'); // LinkedIn API client
const tiktokClient = require('../utils/apiClients/tiktok'); // TikTok API client
const googleAdsenseClient = require('../utils/apiClients/googleAdsense'); // Google AdSense API client
const metaClient = require('../utils/apiClients/meta'); // Meta API client for combined insights
const router = express.Router();

/**
 * @route   GET /api/insights
 * @query   userId (string) - The ID of the user in Firestore
 * @query   platform (string) - The social media platform to fetch insights for
 * @desc    Fetch insights for a specific platform connected to the user's account
 * @access  Private
 */
router.get("/", async (req, res) => {
  const { userId, platform } = req.query;  // Extract userId and platform from query parameters

  try {
    // Fetch user document from Firestore
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      // If user does not exist, return 404
      return res.status(404).json({ error: "User not found" });
    }

    // Get connected social accounts from the user document
    const socialAccounts = userDoc.data().socialAccounts || {};
    let insights = {}; // To store fetched insights

    // Fetch insights based on the specified platform
    if (platform === "instagram" && socialAccounts.instagram?.connected) {
      // Instagram insights
      insights.instagram = await instagramClient.getInsights(socialAccounts.instagram.accessToken);
    } else if (platform === "facebook" && socialAccounts.facebook?.connected) {
      // Facebook insights
      insights.facebook = await facebookClient.getInsights(socialAccounts.facebook.accessToken);
    } else if (platform === "twitter" && socialAccounts.twitter?.connected) {
      // Twitter insights
      insights.twitter = await twitterClient.getInsights(socialAccounts.twitter.accessToken);
    } else if (platform === "linkedin" && socialAccounts.linkedin?.connected) {
      // LinkedIn insights
      insights.linkedin = await linkedinClient.getInsights(socialAccounts.linkedin.accessToken);
    } else if (platform === "tiktok" && socialAccounts.tiktok?.connected) {
      // TikTok insights
      insights.tiktok = await tiktokClient.getInsights(socialAccounts.tiktok.accessToken);
    } else if (platform === "googleAdsense" && socialAccounts.googleAdsense?.connected) {
      // Google AdSense insights
      insights.googleAdsense = await googleAdsenseClient.getInsights(socialAccounts.googleAdsense.accessToken);
    } else if (platform === "meta" && (socialAccounts.facebook?.connected || socialAccounts.instagram?.connected)) {
      // Meta API insights for both Facebook and Instagram
      if (socialAccounts.facebook?.connected) {
        insights.facebook = await metaClient.getInsights(socialAccounts.facebook.accessToken, 'facebook');
      }
      if (socialAccounts.instagram?.connected) {
        insights.instagram = await metaClient.getInsights(socialAccounts.instagram.accessToken, 'instagram');
      }
    } else {
      // If platform is unsupported or not connected
      return res.status(400).json({ error: "Unsupported platform or not connected" });
    }

    // Return the fetched insights
    res.json({ insights });
  } catch (error) {
    // Log and return errors
    console.error("Error fetching insights:", error);
    res.status(500).json({ error: "Failed to fetch insights" });
  }
});

module.exports = router;
