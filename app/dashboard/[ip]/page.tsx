
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useServer } from "@/api";
import { useWebSocket } from "@/api";

export default function ServerDetail() {
  const params = useParams();

  const ip = decodeURIComponent(params.ip as string);

  const { server, isLoading, error, updateStatus, updateServer } =
    useServer(ip);

  const { isConnected } = useWebSocket();

  const [isUpdating, setIsUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    url: "",
  });

  const handleStatusToggle = async () => {
    if (!server) return;

    setIsUpdating(true);

    try {
      const newStatus = server.status === "ON" ? "OFF" : "ON";
      await updateStatus(newStatus);
    } catch (err) {
      console.error("Erreur lors du changement de status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      await updateServer({
        ...(editData.name && { name: editData.name }),
        ...(editData.url && { url: editData.url }),
      });

      setEditMode(false);

      setEditData({
        name: "",
        url: "",
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditChange = (field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 font-semibold"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour au dashboard
        </Link>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : !server ? (
          <div className="text-center py-12">
            <p className="text-slate-300">Serveur non trouvé</p>
          </div>
        ) : (
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{server.name}</h1>
                <p className="text-slate-300 text-lg">{server.ip}</p>
              </div>
              <div
                className={`px-6 py-2 rounded-full text-lg font-semibold ${
                  server.status === 'ON'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {server.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-slate-400 text-sm mb-2">Adresse IP</p>
                <p className="text-white font-mono text-lg">{server.ip}</p>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-2">Statut</p>
                <p className="text-white text-lg font-semibold">{server.status}</p>
              </div>

              <div className="col-span-2">
                <p className="text-slate-400 text-sm mb-2">URL</p>
                <a
                  href={server.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-lg break-all"
                >
                  {server.url}
                </a>
              </div>

              <div className="col-span-2">
                <p className="text-slate-400 text-sm mb-2">Connexion WebSocket</p>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    isConnected
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {isConnected ? 'Connecté' : 'Déconnecté'}
                </div>
              </div>
            </div>

            {editMode ? (
              <div className="bg-slate-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Modifier le serveur</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Nom</label>
                    <input
                      type="text"
                      value={editData.name || server.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      placeholder={server.name}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">URL</label>
                    <input
                      type="text"
                      value={editData.url || server.url}
                      onChange={(e) => handleEditChange('url', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      placeholder={server.url}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition"
                    >
                      {isUpdating ? 'Mise à jour...' : 'Sauvegarder'}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setEditData({ name: '', url: '' });
                      }}
                      className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex gap-4">
              <button
                onClick={handleStatusToggle}
                disabled={isUpdating}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  server.status === 'ON'
                    ? 'bg-red-600 hover:bg-red-700 disabled:bg-slate-600'
                    : 'bg-green-600 hover:bg-green-700 disabled:bg-slate-600'
                } text-white`}
              >
                {isUpdating ? 'Mise à jour...' : server.status === 'ON' ? 'Éteindre' : 'Allumer'}
              </button>

              <button
                onClick={() => setEditMode(!editMode)}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition"
              >
                Modifier
              </button>

              <button
                className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition ml-auto"
                disabled
              >
                Supprimer (bientôt)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
