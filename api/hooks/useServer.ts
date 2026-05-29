'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Server } from '../types';
import { serverService } from '../services/serverService';

export function useServer(ip: string | null) {
  const router = useRouter();
  const [server, setServer] = useState<Server | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServer = async () => {
    if (!ip) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await serverService.getByIp(ip);
      setServer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ip) {
      fetchServer();
    }
  }, [ip]);

  const updateServer = async (updates: Partial<Omit<Server, 'ip'>>) => {
    if (!ip) throw new Error('Pas de serveur sélectionné');
    try {
      const updated = await serverService.update(ip, updates);
      setServer(updated);
      return updated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      throw err;
    }
  };

  const updateStatus = async (status: 'ON' | 'OFF') => {
    return updateServer({ status });
  };

  const deleteServer = async () => {
    if (!ip) throw new Error('Pas de serveur sélectionné');
    try {
      await serverService.delete(ip);
      setServer(null);
      router.push("/dashboard");
    } catch (err) {
      const errorMsg =
      err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMsg);
      throw err;
    } 
  };

  return {
    server,
    isLoading,
    error,
    fetchServer,
    updateServer,
    updateStatus,
    deleteServer,
  };
}
