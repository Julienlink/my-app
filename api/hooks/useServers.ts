'use client';

import { useEffect, useState } from 'react';
import { Server } from '../types';
import { serverService } from '../services/serverService';

interface UseServersOptions {
  autoFetch?: boolean;
}

export function useServers(options: UseServersOptions = {}) {
  const { autoFetch = true } = options;
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await serverService.getAll();
      setServers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchServers();
    }
  }, [autoFetch]);

  const createServer = async (server: Omit<Server, 'id'>) => {
    try {
      const newServer = await serverService.create(server);
      setServers((prev) => [...prev, newServer]);
      return newServer;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      throw err;
    }
  };

  const updateServer = async (ip: string, updates: Partial<Omit<Server, 'ip'>>) => {
    try {
      const updated = await serverService.update(ip, updates);
      setServers((prev) => prev.map((s) => (s.ip === ip ? updated : s)));
      return updated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      throw err;
    }
  };

  const updateStatus = async (ip: string, status: 'ON' | 'OFF') => {
    return updateServer(ip, { status });
  };

  const deleteServer = async (ip: string) => {
    try {
      await serverService.delete(ip);
      setServers((prev) => prev.filter((s) => s.ip !== ip));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      throw err;
    }
  };

  return {
    servers,
    isLoading,
    error,
    fetchServers,
    createServer,
    updateServer,
    updateStatus,
    deleteServer,
  };
}
