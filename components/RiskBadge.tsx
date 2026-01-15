import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Ban, UserPlus } from 'lucide-react';

interface RiskBadgeProps {
  level: 'Safe' | 'Moderate' | 'High Risk' | 'Critical' | 'New User';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const getConfig = () => {
    switch (level) {
      case 'Safe':
        return { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: ShieldCheck, label: 'Safe Customer' };
      case 'Moderate':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle, label: 'Moderate Risk' };
      case 'High Risk':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: ShieldAlert, label: 'High Risk' };
      case 'Critical':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: Ban, label: 'Fraud Detected' };
      case 'New User':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: UserPlus, label: 'New User - Low Risk' };
      default:
        return { color: 'bg-slate-100 text-slate-800', icon: UserPlus, label: 'Unknown' };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-full border ${config.color}`}>
      <Icon className="w-5 h-5 mr-2" />
      <span className="font-semibold">{config.label}</span>
    </div>
  );
};