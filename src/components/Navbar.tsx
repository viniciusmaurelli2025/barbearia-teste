import React from 'react';
import {
  Calendar,
  Home,
  Moon,
  Scissors,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScreenTab } from '../types';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    isAdmin,
    businessSettings,
  } = useApp();

  const navItems: { id: ScreenTab; label: string; mobileLabel: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Início',
      mobileLabel: 'Início',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'cuts',
      label: 'Cortes',
      mobileLabel: 'Cortes',
      icon: <Scissors className="w-5 h-5" />,
    },
    {
      id: 'ai',
      label: 'Visualize com IA',
      mobileLabel: 'IA',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 'booking',
      label: 'Agendamento',
      mobileLabel: 'Agendar',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'profile',
      label: 'Perfil',
      mobileLabel: 'Perfil',
      icon: <User className="w-5 h-5" />,
    },
  ];

  const handleNav = (tab: ScreenTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Bar — 3-Zone Contract */}
      <header className="sticky top-0 z-40 h-14 md:h-16 border-b border-white/10 bg-[#070605]/90 backdrop-blur-md px-4 md:px-8 flex items-center justify-between">
        {/* Zone 1: Single Text Element Wordmark */}
        <button
          onClick={() => handleNav('home')}
          className="font-display text-lg md:text-xl font-bold tracking-wider text-[#F5F2ED] text-left whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A84F1F] rounded"
        >
          {businessSettings.shopName || 'BARBERIA'}
        </button>

        {/* Zone 2: Clean Text Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A9A29B]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`py-1 whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? 'text-[#F5F2ED] border-[#A84F1F]'
                    : 'border-transparent hover:text-[#F5F2ED]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className={`py-1 whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'text-[#A84F1F] border-[#A84F1F]'
                  : 'border-transparent text-[#A9A29B] hover:text-[#F5F2ED]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Painel Admin</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-[#A84F1F] hover:text-[#F5F2ED] transition-colors"
              aria-label="Painel Administrativo"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-white/10 text-[#A9A29B] hover:text-[#F5F2ED] hover:border-white/20 transition-colors"
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleNav('booking')}
            className="px-4 py-2 min-h-[40px] rounded-lg bg-[#A84F1F] hover:bg-[#8E4118] active:scale-[0.98] text-[#F5F2ED] text-xs md:text-sm font-semibold whitespace-nowrap transition-all"
          >
            Agendar agora
          </button>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Navegação principal"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#070605]/95 backdrop-blur-md border-t border-white/10 grid grid-cols-5 items-center px-1"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
                isActive ? 'text-[#A84F1F]' : 'text-[#A9A29B] hover:text-[#F5F2ED]'
              }`}
            >
              {item.icon}
              <span className="text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap">
                {item.mobileLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
