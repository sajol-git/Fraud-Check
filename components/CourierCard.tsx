import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CourierName, CourierStats } from '../types';
import { Package, XCircle, CheckCircle } from 'lucide-react';

interface CourierCardProps {
  name: CourierName;
  stats: CourierStats;
}

export const CourierCard: React.FC<CourierCardProps> = ({ name, stats }) => {
  const data = [
    { name: 'Delivered', value: stats.delivered },
    { name: 'Returned/Cancelled', value: stats.cancelled },
  ];

  const COLORS = ['#10b981', '#f43f5e']; // Emerald-500, Rose-500

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center">
          <Package className="w-5 h-5 mr-2 text-indigo-500" />
          {name}
        </h3>
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {stats.totalParcels} Orders
        </span>
      </div>

      <div className="flex-1 flex items-center justify-between">
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg mr-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Success</p>
              <p className="text-xl font-bold text-slate-900">{stats.delivered}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="p-2 bg-rose-100 rounded-lg mr-3">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Failed</p>
              <p className="text-xl font-bold text-slate-900">{stats.cancelled}</p>
            </div>
          </div>
        </div>

        <div className="h-32 w-32 relative">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: '600' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className={`text-sm font-bold ${stats.successRate >= 80 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {Math.round(stats.successRate)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};