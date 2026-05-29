'use client';

import { useServers } from '@/api';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateServer() {
  const router = useRouter();
  const { createServer, error } = useServers({ autoFetch: false });
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    ip: '',
    name: '',
    status: 'ON' as const,
    url: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.ip || !formData.name || !formData.url) {
      setFormError('Tous les champs sont requis');
      return;
    }

    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(formData.ip)) {
      setFormError('Format IP invalide');
      return;
    }

    setIsCreating(true);
    try {
      await createServer(formData);
      router.push('/dashboard');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 font-semibold"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour au dashboard
        </Link>

        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Ajouter un serveur</h1>

          {(error || formError) && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-400">{error || formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="ip" className="block text-slate-300 text-sm font-semibold mb-2">
                Adresse IP *
              </label>
              <input
                type="text"
                id="ip"
                name="ip"
                value={formData.ip}
                onChange={handleChange}
                placeholder="192.168.1.1"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              <p className="text-slate-400 text-xs mt-1">Format: XXX.XXX.XXX.XXX</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-slate-300 text-sm font-semibold mb-2">
                Nom du serveur *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Mon serveur"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-slate-300 text-sm font-semibold mb-2">
                URL *
              </label>
              <input
                type="text"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="http://localhost:3000"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-slate-300 text-sm font-semibold mb-2">
                Statut
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ON">ON (Allumé)</option>
                <option value="OFF">OFF (Éteint)</option>
              </select>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isCreating}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition"
              >
                {isCreating ? 'Création...' : 'Créer le serveur'}
              </button>
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition text-center"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
