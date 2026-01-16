const { getSteadfastScore } = require('./steadfast');

// BD Phone Number Validation Regex: Starts with 01, followed by 3-9, then 8 digits.
const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters
  let cleaned = phone.toString().replace(/\D/g, '');
  
  // Handle 880 prefix
  if (cleaned.startsWith('880')) {
    cleaned = cleaned.substring(2);
  }
  
  return cleaned;
};

const checkFraud = async (req, res) => {
  const { phone: rawPhone } = req.body;
  
  const phone = normalizePhoneNumber(rawPhone);

  // 1. Validation
  if (!phone || !BD_PHONE_REGEX.test(phone)) {
    return res.status(400).json({ 
      error: 'Invalid phone number format. Must be a valid Bangladeshi number (e.g., 017XXXXXXXX).' 
    });
  }

  try {
    // 2. Service Calls
    
    // Pathao is currently disabled.
    const pathaoStats = { totalParcels: 0, delivered: 0, cancelled: 0, successRate: 0 };
    
    let steadfastStats = { totalParcels: 0, delivered: 0, cancelled: 0, successRate: 0 };
    
    try {
        const steadfastData = await getSteadfastScore(phone);
        
        // Steadfast API usually returns total_orders and delivery_ratio
        const total = steadfastData.total_orders || 0;
        const ratio = steadfastData.delivery_ratio || 0;
        
        // Calculate delivered/cancelled estimates based on the ratio provided
        const delivered = steadfastData.delivered_orders ?? Math.round(total * (ratio / 100));
        const cancelled = steadfastData.cancelled_orders ?? (total - delivered);

        steadfastStats = {
            totalParcels: total,
            delivered: delivered,
            cancelled: cancelled,
            successRate: ratio
        };
    } catch (err) {
        // Log but do not fail the request. Return 0 stats for Steadfast if it fails.
        // This handles 500s from Steadfast. 404s are handled in getSteadfastScore.
        console.warn(`Steadfast Service Check Failed for ${phone}:`, err.message);
    }

    // 3. Aggregate and Risk Calculation
    const totalDelivered = pathaoStats.delivered + steadfastStats.delivered;
    const totalParcels = pathaoStats.totalParcels + steadfastStats.totalParcels;
    const globalSuccessRate = totalParcels > 0 ? (totalDelivered / totalParcels) * 100 : 0;

    let riskLevel = 'Safe';
    if (totalParcels === 0) {
      riskLevel = 'New User';
    } else if (globalSuccessRate < 50) {
      riskLevel = 'Critical';
    } else if (globalSuccessRate < 70) {
      riskLevel = 'High Risk';
    } else if (globalSuccessRate < 85) {
      riskLevel = 'Moderate';
    }

    const responseData = {
      phone,
      name: "Customer",
      address: "Address Hidden", 
      aggregateScore: Math.round(globalSuccessRate),
      riskLevel,
      dataSource: 'backend',
      couriers: {
        'Pathao': pathaoStats,
        'Steadfast': steadfastStats
      },
      recentHistory: [] 
    };

    res.json(responseData);

  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ error: 'Internal Server Error processing fraud check' });
  }
};

module.exports = { checkFraud };