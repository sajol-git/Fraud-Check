import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { checkFraud } from './services/courierApi';
import { CustomerData, CourierName } from './types';
import { RiskBadge } from './components/RiskBadge';
import { CourierCard } from './components/CourierCard';
import { Shield, TrendingUp, AlertCircle, History, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (phone: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await checkFraud(phone);
      setData(result);
    } catch (err) {
      setError("Failed to fetch data from courier services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRecommendation = (risk: string) => {
    switch (risk) {
      case 'Safe':
        return "This customer has a high delivery success rate. Safe to process COD orders.";
      case 'New User':
        return "This is a new customer with no previous delivery history. Standard verification advised.";
      case 'Critical':
        return "Extreme caution advised. Request partial or full advance payment before shipping.";
      case 'High Risk':
      case 'Moderate':
        return "Monitor closely. Customer has a history of some returned parcels.";
      default:
        return "Perform manual verification.";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center text-indigo-600">
                <Shield className="h-8 w-8 mr-2" />
                <span className="font-bold text-xl tracking-tight text-slate-900">Courier Shield</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
                    BETA
                </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-12 sm:py-20 bg-gradient-to-b from-indigo-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Detect Delivery Fraud <span className="text-indigo-600">Instantly</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Aggregated delivery intelligence from Pathao and Steadfast to protect your business from serial returners.
          </p>
          
          <SearchBar onSearch={handleSearch} isLoading={loading} />
          
          <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-slate-500">
             <span className="flex items-center"><span className="w-2 h-2 bg-slate-300 rounded-full mr-2"></span>Pathao Paused</span>
             <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Steadfast Active</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-3" />
                {error}
            </div>
        )}

        {data && (
          <div className="mt-8 space-y-8 animate-fade-in-up">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Score Card */}
              <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                   <div>
                       <h2 className="text-2xl font-bold text-slate-900 mb-1">Customer Analysis</h2>
                       <div className="flex items-center mt-1 space-x-3">
                           <p className="text-slate-500 font-mono text-lg">{data.phone}</p>
                           
                           {/* Data Source Badge */}
                           {data.dataSource === 'simulation' ? (
                               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                   <WifiOff className="w-3 h-3 mr-1" /> Simulated Data
                               </span>
                           ) : (
                               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                   <Wifi className="w-3 h-3 mr-1" /> Live: {data.dataSource === 'backend' ? 'Server' : 'Direct API'}
                               </span>
                           )}
                       </div>
                   </div>
                   <div className="mt-4 md:mt-0">
                       <RiskBadge level={data.riskLevel} />
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-sm font-medium text-slate-500 mb-1">Trust Score</p>
                        <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-slate-900">{data.aggregateScore}</span>
                            <span className="text-sm text-slate-400 ml-1">/ 100</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${data.aggregateScore > 75 ? 'bg-emerald-500' : data.aggregateScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                style={{ width: `${data.aggregateScore}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Parcels</p>
                        <p className="text-3xl font-bold text-slate-900">
                            {data.couriers[CourierName.PATHAO].totalParcels + data.couriers[CourierName.STEADFAST].totalParcels}
                        </p>
                        <p className="text-xs text-indigo-600 mt-2 font-medium flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" /> All time history
                        </p>
                    </div>

                     <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-sm font-medium text-slate-500 mb-1">Est. Address</p>
                        <p className="text-lg font-semibold text-slate-900 truncate">
                            {data.address || "N/A"}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">Based on last delivery</p>
                    </div>
                </div>
              </div>

              {/* Quick Actions / Summary */}
              <div className="col-span-1 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 p-6 text-white flex flex-col justify-between">
                 <div>
                     <h3 className="text-lg font-bold mb-2">Recommendation</h3>
                     <p className="text-indigo-100 text-sm leading-relaxed">
                        {getRecommendation(data.riskLevel)}
                     </p>
                 </div>
                 <div className="mt-6 pt-6 border-t border-indigo-500/30">
                     <div className="flex items-center justify-between text-sm font-medium">
                         <span>Fraud Probability</span>
                         <span>{data.riskLevel === 'New User' ? 'Unknown' : `${100 - data.aggregateScore}%`}</span>
                     </div>
                 </div>
              </div>
            </div>

            {/* Courier Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CourierCard name={CourierName.PATHAO} stats={data.couriers[CourierName.PATHAO]} />
                <CourierCard name={CourierName.STEADFAST} stats={data.couriers[CourierName.STEADFAST]} />
            </div>

            {/* Recent History Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
                    <History className="w-5 h-5 text-slate-400 mr-2" />
                    <h3 className="font-semibold text-slate-800">Recent Activity Log</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Courier</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.recentHistory.length > 0 ? (
                                data.recentHistory.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-3">{item.date}</td>
                                    <td className="px-6 py-3 font-medium">{item.courier}</td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${item.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 
                                              item.status === 'Returned' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">
                                        No recent detailed history available via API
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

          </div>
        )}

        {!data && !loading && !error && (
            <div className="mt-20 text-center opacity-50">
                <p className="text-slate-400">Search for a number to view reports from courier partners.</p>
            </div>
        )}
      </main>
    </div>
  );
}