const { google } = require('googleapis');

/**
 * Fetch Google AdSense insights.
 * 
 * @param {string} accessToken - Google OAuth 2.0 access token.
 * @returns {object} Insights data from Google AdSense API.
 */
const getInsights = async (accessToken) => {
  try {
    const adsense = google.adsense('v2');
    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: accessToken });

    // Fetch AdSense report (replace {accountId} with actual ID)
    const res = await adsense.accounts.report.generate({
      account: 'accounts/{accountId}',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      dimension: ['DATE'], // Group data by date
      metric: ['CLICKS', 'IMPRESSIONS', 'EARNINGS'], // Example metrics
    });

    return res.data;
  } catch (error) {
    console.error('Error fetching Google AdSense insights:', error.response?.data || error.message);
    throw new Error('Failed to fetch Google AdSense insights');
  }
};

module.exports = { getInsights };
