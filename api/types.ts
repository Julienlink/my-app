export const runtime = 'nodejs';
export interface Server {
  ip: string;
  name: string;
  status: 'ON' | 'OFF';
  url: string;
}

export interface WebSocketMessage {
  from: string;
  timestamp: string;
  data: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
