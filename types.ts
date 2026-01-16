export enum CourierName {
  PATHAO = 'Pathao',
  STEADFAST = 'Steadfast',
}

export interface CourierStats {
  totalParcels: number;
  delivered: number;
  cancelled: number;
  successRate: number; // 0-100
}

export interface CustomerData {
  phone: string;
  name?: string;
  address?: string;
  aggregateScore: number; // 0-100, where 100 is best
  riskLevel: 'Safe' | 'Moderate' | 'High Risk' | 'Critical' | 'New User';
  dataSource?: 'backend' | 'client-api' | 'simulation';
  couriers: {
    [CourierName.PATHAO]: CourierStats;
    [CourierName.STEADFAST]: CourierStats;
  };
  recentHistory: Array<{
    date: string;
    courier: CourierName;
    status: 'Delivered' | 'Cancelled' | 'Returned';
  }>;
}

export interface ApiError {
  message: string;
}