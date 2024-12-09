const axios = require('axios');

/**
 * Fetch Twitter insights.
 * 
 * @param {string} accessToken - Twitter API access token.
 * @returns {object} Insights data from Twitter API.
 */
const getInsights = async (accessToken) => {
  try {
    const url = `https://api.twitter.com/2/tweets`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        "tweet.fields": "public_metrics,created_at", // Fetch tweet metrics
        "max_results": 10, // Example: Limit to 10 tweets
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching Twitter insights:", error.response?.data || error.message);
    throw new Error("Failed to fetch Twitter insights");
  }
};

module.exports = { getInsights };
