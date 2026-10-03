/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { CutsCatalogScreen } from './components/CutsCatalogScreen';
import { BarberAiScreen } from './components/BarberAiScreen';
import { BookingScreen } from './components/BookingScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AdminPanelScreen } from './components/AdminPanelScreen';
import { CutDetailModal } from './components/CutDetailModal';

const MainShell: React.FC = () => {
  const { activeTab, setActiveTab, businessSettings, toasts } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[#A84F1F] selection:text-[#F5F2ED]">
      <Navbar />

      <main className="flex-1">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'cuts' && <CutsCatalogScreen />}
        {activeTab === 'ai' && <BarberAiScreen />}
        {activeTab === 'booking' && <BookingScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
        {activeTab === 'admin' && <AdminPanelScreen />}
      </main>

      {/* Cut Detail Modal */}
      <CutDetailModal />

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold backdrop-blur-md transition-all ${
                t.type === 'error'
                  ? 'bg-red-950/95 border-red-700 text-red-100'
                  : 'bg-[#14110F]/95 border-[#A84F1F] text-[#F5F2ED]'
              }`}
            >
              {t.text}
            </div>
          ))}
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-white/10 py-10 px-4 md:px-8 mb-16 md:mb-0 bg-[#070605]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-[#A9A29B]">
          <div>
            <p className="font-display text-base font-bold text-[#F5F2ED]">
              {businessSettings.shopName}
            </p>
            <p className="mt-1">
              Corte, estilo e tecnologia em uma única experiência.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <button
              onClick={() => setActiveTab('home')}
              className="hover:text-[#F5F2ED] transition-colors"
            >
              Início
            </button>
            <button
              onClick={() => setActiveTab('cuts')}
              className="hover:text-[#F5F2ED] transition-colors"
            >
              Catálogo de Cortes
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className="hover:text-[#F5F2ED] transition-colors"
            >
              Barber AI
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className="hover:text-[#F5F2ED] transition-colors"
            >
              Agendamento
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="hover:text-[#F5F2ED] transition-colors"
            >
              Perfil
            </button>
          </div>

          <div className="font-mono-num">
            © {new Date().getFullYear()} {businessSettings.shopName}. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
}
