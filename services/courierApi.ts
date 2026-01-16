import { CustomerData, CourierName } from '../types';

const BACKEND_URL = '/api/check-fraud';
const STEADFAST_URL = 'https://portal.packzy.com/api/v1/courier_score';

// Keys provided for client-side fallback
const STEADFAST_API_KEY = 'k4eymhg5b4dc89tuv7a97gzbsia5s4qn';
const STEADFAST_SECRET_KEY = 'zumoaxqtybugksz6c3bgg4bd';

// Helper for fetching with a timeout to prevent hanging UI
async function fetchWithTimeout(resource: RequestInfo, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 3000 } = options; // Default 3s timeout
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal  
      });
      clearTimeout(id);
      return response;
  } catch (error) {
      clearTimeout(id);
      throw error;
  }
}

// Utility to ensure phone is clean before using in fallbacks
const cleanPhone = (phone: string) => {
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('880')) p = p.substring(2);
    return p;
};

export const checkFraud = async (phone: string): Promise<CustomerData> => {
  const sanitizedPhone = cleanPhone(phone);
  try {
    // 1. Attempt to fetch from the Node.js Backend
    // Fail fast (1.5s) if backend is not running to switch to fallback quickly
    const response = await fetchWithTimeout(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: sanitizedPhone }),
      timeout: 1500 
    });

    if (response.ok) {
      // Check content type to ensure we didn't get index.html (SPA fallback)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
         return await response.json();
      }
    }
    
    // If we get a 400 here, it means the Backend is up but rejected the request.
    // However, since we sanitized the input, a 400 is unlikely unless regex mismatch.
    // We throw to trigger fallback.
    throw new Error(`Backend unavailable or returned error ${response.status}`);
  } catch (error) {
    console.warn("Backend check failed, switching to client-side fallback...", error);
    return await runClientSideFallback(sanitizedPhone);
  }
};

// Fallback: Runs the logic inside the browser if the server isn't running
async function runClientSideFallback(phone: string): Promise<CustomerData> {
  let steadfastStats = { totalParcels: 0, delivered: 0, cancelled: 0, successRate: 0 };

  // 2. Attempt Direct API Call to Steadfast
  try {
    const response = await fetchWithTimeout(STEADFAST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': STEADFAST_API_KEY,
        'Secret-Key': STEADFAST_SECRET_KEY
      },
      body: JSON.stringify({ phone }),
      timeout: 4000 // Allow 4s for external API
    });

    if (response.ok) {
      const data = await response.json();
      const total = data.total_orders || 0;
      const ratio = data.delivery_ratio || 0;
      const delivered = data.delivered_orders ?? Math.round(total * (ratio / 100));
      
      steadfastStats = {
        totalParcels: total,
        delivered: delivered,
        cancelled: total - delivered,
        successRate: ratio
      };
    } else if (response.status === 404) {
        // 404 means User Not Found, which is a valid result (0 parcels)
        // Do NOT throw error here, or it will trigger simulation
        console.info("User not found in Steadfast (404), treating as new user.");
        steadfastStats = { totalParcels: 0, delivered: 0, cancelled: 0, successRate: 0 };
    } else {
        throw new Error(`Steadfast Direct Call Failed: ${response.status}`);
    }
  } catch (err) {
    console.warn("Direct API call failed (likely CORS or timeout). Using Simulation Data based on phone number.", err);
    // 3. Final Fallback: Simulation for Demo/Preview purposes
    return generateSimulationData(phone);
  }

  // If we got here, we have real Steadfast data but no Pathao data
  return calculateRisk(phone, { totalParcels: 0, delivered: 0, cancelled: 0, successRate: 0 }, steadfastStats, 'client-api');
}

// Helper to calculate risk
function calculateRisk(phone: string, pathaoStats: any, steadfastStats: any, source: 'backend' | 'client-api' | 'simulation' = 'backend'): CustomerData {
  const totalDelivered = pathaoStats.delivered + steadfastStats.delivered;
  const totalParcels = pathaoStats.totalParcels + steadfastStats.totalParcels;
  const globalSuccessRate = totalParcels > 0 ? (totalDelivered / totalParcels) * 100 : 0;

  let riskLevel: any = 'Safe';
  if (totalParcels === 0) riskLevel = 'New User';
  else if (globalSuccessRate < 50) riskLevel = 'Critical';
  else if (globalSuccessRate < 70) riskLevel = 'High Risk';
  else if (globalSuccessRate < 85) riskLevel = 'Moderate';

  return {
    phone,
    name: "Customer",
    address: "Address Hidden",
    aggregateScore: Math.round(globalSuccessRate),
    riskLevel,
    dataSource: source,
    couriers: {
      [CourierName.PATHAO]: pathaoStats,
      [CourierName.STEADFAST]: steadfastStats
    },
    recentHistory: []
  };
}

// Deterministic Mock Generator for Demo Purposes
function generateSimulationData(phone: string): CustomerData {
  const lastDigit = parseInt(phone.slice(-1)) || 0;
  
  // Case 0: New User
  if (lastDigit === 0) {
     return calculateRisk(phone, 
        { totalParcels: 0, delivered: 0, cancelled: 0, successRate: 0 },
        { totalParcels: 0, delivered: 0, cancelled: 0, successRate: 0 },
        'simulation'
     );
  }

  // Deterministic "Randomness" based on phone number
  const isRisky = lastDigit <= 3; // 1, 2, 3 are risky
  const isModerate = lastDigit > 3 && lastDigit <= 5; // 4, 5 moderate
  
  // Pathao is DISABLED/PAUSED
  const pathaoStats = {
      totalParcels: 0,
      delivered: 0,
      cancelled: 0,
      successRate: 0
  };

  // Generate Steadfast Stats (Live simulation)
  const sTotal = 3 + lastDigit;
  let sRatio = isRisky ? 0.3 : (isModerate ? 0.70 : 0.88);
  const sDelivered = Math.floor(sTotal * sRatio);

  const steadfastStats = {
      totalParcels: sTotal,
      delivered: sDelivered,
      cancelled: sTotal - sDelivered,
      successRate: (sDelivered / sTotal) * 100
  };

  return calculateRisk(phone, pathaoStats, steadfastStats, 'simulation');
}