const axios = require('axios');

/**
 * Fetch Meta insights (Facebook or Instagram).
 * 
 * @param {string} accessToken - Meta API access token.
 * @param {string} platform - Specify 'facebook' or 'instagram'.
 * @returns {object} Insights data for the specified platform.
 */
const getInsights = async (accessToken, platform) => {
  try {
    let url = '';
    const metrics = ['page_impressions', 'page_engaged_users', 'reach']; // Example metrics

    if (platform === 'facebook') {
      url = `https://graph.facebook.com/v14.0/me/insights`;
    } else if (platform === 'instagram') {
      url = `https://graph.instagram.com/me/insights`;
    }

    const response = await axios.get(url, {
      params: {
        metric: metrics.join(','), // Combine metrics
        access_token: accessToken,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching Meta insights for ${platform}:`, error.response?.data || error.message);
    throw new Error(`Failed to fetch ${platform} insights`);
  }
};

module.exports = { getInsights };
