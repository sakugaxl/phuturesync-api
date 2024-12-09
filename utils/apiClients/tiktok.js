const axios = require('axios');

/**
 * Fetch TikTok insights.
 * 
 * @param {string} accessToken - TikTok API access token.
 * @returns {object} Insights data from TikTok API.
 */
const getInsights = async (accessToken) => {
  try {
    const url = `https://business-api.tiktokglobalshop.com/open_api/v1.2/ad/insights`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching TikTok insights:", error.response?.data || error.message);
    throw new Error("Failed to fetch TikTok insights");
  }
};

module.exports = { getInsights };
