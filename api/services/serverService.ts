export const runtime = 'nodejs';
import { Server, ApiResponse } from '../types';

class ServerService {
  private baseUrl = '/api/servers';

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      } else {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
      }
    }
    return response.json();
  }

  async getAll(): Promise<Server[]> {
    const response = await fetch(this.baseUrl);
    const data: ApiResponse<Server[]> = await this.handleResponse(response);
    if (!data.success) throw new Error(data.error || 'Erreur lors de la récupération des serveurs');
    return data.data || [];
  }

  async getByIp(ip: string): Promise<Server> {
    const response = await fetch(`${this.baseUrl}/${encodeURIComponent(ip)}`);
    const data: ApiResponse<Server> = await this.handleResponse(response);
    if (!data.success) throw new Error(data.error || 'Serveur non trouvé');
    return data.data!;
  }

  async create(server: Omit<Server, 'id'>): Promise<Server> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(server),
    });
    const data: ApiResponse<Server> = await this.handleResponse(response);
    if (!data.success) throw new Error(data.error || 'Erreur lors de la création');
    return data.data!;
  }

  async update(ip: string, updates: Partial<Omit<Server, 'ip'>>): Promise<Server> {
    const response = await fetch(`${this.baseUrl}/${encodeURIComponent(ip)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data: ApiResponse<Server> = await this.handleResponse(response);
    if (!data.success) throw new Error(data.error || 'Erreur lors de la mise à jour');
    return data.data!;
  }

  async updateStatus(ip: string, status: 'ON' | 'OFF'): Promise<Server> {
    return this.update(ip, { status });
  }

  async delete(ip: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${encodeURIComponent(ip)}`, {
      method: 'DELETE',
    });
    const data: ApiResponse<void> = await this.handleResponse(response);
    if (!data.success) throw new Error(data.error || 'Erreur lors de la suppression');
  }
}

export const serverService = new ServerService();
