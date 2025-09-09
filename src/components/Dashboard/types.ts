
export interface DashboardStat {
  name: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

export interface RecentCampaign {
  id: string;
  name: string;
  type: string;
  participants: number;
  status: string;
  createdAt: string;
  image?: string;
}

export interface GameType {
  type: string;
  label: string;
}
