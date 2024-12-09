const axios = require('axios');

/**
 * Fetch Instagram insights.
 * 
 * @param {string} accessToken - Instagram Graph API access token.
 * @param {object} options - Optional query parameters (e.g., since, until).
 * @returns {object} Insights data from Instagram API.
 */
const getInsights = async (accessToken, options = {}) => {
  try {
    const url = `https://graph.instagram.com/v14.0/me/insights`;
    const params = {
      metric: "follower_count,reach,impressions,profile_views,website_clicks", // Example metrics
      access_token: accessToken,
      ...options, // Optional parameters
    };

    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching Instagram insights:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { getInsights };
