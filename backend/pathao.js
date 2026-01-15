const axios = require('axios');
const Keyv = require('keyv');

// Initialize Keyv (in-memory by default, can be configured for Redis/SQLite)
const keyv = new Keyv();

const BASE_URL = process.env.PATHAO_BASE_URL || 'https://api-hermes.pathao.com';

async function getAccessToken() {
  // Try to get token from cache
  const cachedToken = await keyv.get('pathao_token');
  if (cachedToken) {
    return cachedToken;
  }

  try {
    const response = await axios.post(`${BASE_URL}/aladdin/api/v1/issue-token`, {
      client_id: process.env.PATHAO_CLIENT_ID,
      client_secret: process.env.PATHAO_CLIENT_SECRET,
      username: process.env.PATHAO_USERNAME,
      password: process.env.PATHAO_PASSWORD,
      grant_type: 'password',
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const { access_token, expires_in } = response.data;

    // Cache the token. Buffer by 60s to ensure validity.
    // expires_in is in seconds, Keyv ttl is in milliseconds.
    const ttl = (expires_in - 60) * 1000;
    await keyv.set('pathao_token', access_token, ttl);

    return access_token;
  } catch (error) {
    console.error('Pathao Auth Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Pathao');
  }
}

async function getPathaoScore(phone) {
  try {
    const token = await getAccessToken();
    const response = await axios.post(`${BASE_URL}/aladdin/api/v1/user-success-rate`, 
      { phone },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    return response.data.data;
  } catch (error) {
    // Handle 404 (Not Found) as 0 history rather than error
    if (error.response && error.response.status === 404) {
      return { delivered: 0, cancelled: 0, success_rate: 0 };
    }
    console.error('Pathao Score Error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { getPathaoScore };