const axios = require('axios');

/**
 * Fetch LinkedIn insights.
 * 
 * @param {string} accessToken - LinkedIn API access token.
 * @returns {object} Insights data from LinkedIn API.
 */
const getInsights = async (accessToken) => {
  try {
    const url = `https://api.linkedin.com/v2/analytics`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Authorization header
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching LinkedIn insights:", error.response?.data || error.message);
    throw new Error("Failed to fetch LinkedIn insights");
  }
};

module.exports = { getInsights };
