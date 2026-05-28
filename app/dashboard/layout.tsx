export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Serveurs Manager</h1>
            <div className="flex gap-4">
              <a
                href="/dashboard"
                className="text-slate-300 hover:text-white transition"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
