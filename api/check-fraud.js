const { checkFraud } = require('../backend/fraudController');

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ensure body is parsed if Vercel doesn't automatically (usually it does for JSON)
  if (!req.body && req.headers['content-type']?.includes('application/json')) {
      // In some environments, body might need manual parsing if not handled by middleware
      // But standard Vercel Node.js functions provide req.body object if content-type is json
  }

  return checkFraud(req, res);
};