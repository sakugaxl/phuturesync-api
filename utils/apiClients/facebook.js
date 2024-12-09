const axios = require('axios');

/**
 * Fetch insights for a Facebook page.
 * 
 * @param {string} accessToken - Facebook API access token.
 * @param {object} options - Optional query parameters (e.g., since, until).
 * @returns {object} Insights data from Facebook API.
 */
const getInsights = async (accessToken, options = {}) => {
  try {
    const url = `https://graph.facebook.com/v14.0/me/insights`;
    const metrics = ["page_impressions", "page_engaged_users"]; // Example metrics
    const params = {
      metric: metrics.join(','), // Combine metrics into a single query parameter
      access_token: accessToken,
      ...options, // Optional parameters
    };

    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching Facebook insights:", error.response?.data || error.message);
    throw new Error("Failed to fetch Facebook insights");
  }
};

module.exports = { getInsights };
