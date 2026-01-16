const axios = require('axios');

const BASE_URL = 'https://portal.packzy.com/api/v1/courier_score';

async function getSteadfastScore(phone) {
  // Using provided credentials as defaults.
  const apiKey = process.env.STEADFAST_API_KEY || 'k4eymhg5b4dc89tuv7a97gzbsia5s4qn';
  const secretKey = process.env.STEADFAST_SECRET_KEY || 'zumoaxqtybugksz6c3bgg4bd';

  if (!apiKey || !secretKey) {
    throw new Error('Steadfast credentials missing');
  }

  try {
    const response = await axios.post(BASE_URL, 
      { phone },
      {
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': apiKey,
          'Secret-Key': secretKey,
        }
      }
    );

    return response.data;
  } catch (error) {
    // If user is not found (404), return empty stats. This is valid data.
    if (error.response && error.response.status === 404) {
        return { 
            total_orders: 0, 
            delivered_orders: 0, 
            cancelled_orders: 0, 
            delivery_ratio: 0 
        };
    }
    
    console.error('Steadfast Score Error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { getSteadfastScore };