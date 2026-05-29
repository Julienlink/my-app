'use client';

import { useServers } from '@/api';
import Link from 'next/link';

export default function Dashboard() {
  const { servers, isLoading, error } = useServers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard Serveurs</h1>
          <p className="text-slate-300">Gère et surveille tes serveurs</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : servers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-300 mb-6">Aucun serveur trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map((server) => (
              <Link
                key={server.ip}
                href={`/dashboard/${encodeURIComponent(server.ip)}`}
                className="group"
              >
                <div className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 rounded-lg p-6 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-blue-400 transition">
                        {server.name}
                      </h3>
                      <p className="text-sm text-slate-400">{server.ip}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        server.status === 'ON'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {server.status}
                    </div>
                  </div>

                  <div className="mb-4 pt-4 border-t border-slate-600">
                    <p className="text-xs text-slate-400 mb-1">URL</p>
                    <p className="text-sm text-slate-200 truncate">{server.url}</p>
                  </div>

                  <div className="flex items-center text-blue-400 text-sm font-semibold">
                    Voir les détails
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <h3>Ajout de serveur automatique</h3>
        </div>
      </div>
    </div>
  );
}
