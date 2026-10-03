/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';
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
  const cleanWhatsapp = (businessSettings.whatsapp || '552197507533').replace(
    /\D/g,
    ''
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[#A84F1F] selection:text-[#F5F2ED]">
      <Navbar />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'home' && <HomeScreen />}
            {activeTab === 'cuts' && <CutsCatalogScreen />}
            {activeTab === 'ai' && <BarberAiScreen />}
            {activeTab === 'booking' && <BookingScreen />}
            {activeTab === 'profile' && <ProfileScreen />}
            {activeTab === 'admin' && <AdminPanelScreen />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Cut Detail Modal */}
      <CutDetailModal />

      {/* Toast Notifications */}
      <div
        aria-live="polite"
        className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold backdrop-blur-md pointer-events-auto ${
                t.type === 'error'
                  ? 'bg-red-950/95 border-red-700 text-red-100'
                  : 'bg-[#14110F]/95 border-[#A84F1F] text-[#F5F2ED]'
              }`}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quiet Footer */}
      <footer className="border-t border-white/10 py-10 px-4 md:px-8 mb-16 md:mb-0 bg-[#070605]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-[#A9A29B]">
          <div>
            <p className="font-display text-base font-extrabold text-[#F5F2ED]">
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
            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A84F1F] hover:underline font-semibold flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp (21) 9750-7533</span>
            </a>
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
