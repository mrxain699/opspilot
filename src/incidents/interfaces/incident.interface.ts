export interface Incident {
  id: string;
  service: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: 'open' | 'resolved';
  createdAt: Date;
}
