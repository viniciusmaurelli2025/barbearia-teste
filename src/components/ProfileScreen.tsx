import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  Calendar,
  Heart,
  LogIn,
  LogOut,
  MessageCircle,
  Moon,
  Save,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResilientImage } from './ResilientImage';

export const ProfileScreen: React.FC = () => {
  const {
    user,
    isAdmin,
    userProfile,
    userPrivateInfo,
    signInWithGoogle,
    logout,
    updateUserProfileInfo,
    favoriteCutIds,
    toggleFavoriteCut,
    haircuts,
    savedReferences,
    removeSavedReference,
    aiGenerations,
    removeAiGenerationRecord,
    appointments,
    cancelAppointment,
    theme,
    toggleTheme,
    setActiveTab,
    setActiveCutDetail,
    openBookingWithCut,
    businessSettings,
  } = useApp();

  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    setNameInput(userProfile?.displayName || user?.displayName || '');
    setPhoneInput(userPrivateInfo?.phone || '');
  }, [userProfile, userPrivateInfo, user]);

  const favoriteCuts = haircuts.filter((c) => favoriteCutIds.includes(c.id));
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'confirmed'
  );
  const pastAppointments = appointments.filter((a) => a.status !== 'confirmed');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfileInfo(nameInput, phoneInput);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-10 pb-28">
      {/* Header & Auth Card */}
      <div className="rounded-2xl bg-[#14110F] border border-white/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#582610] border border-[#A84F1F] flex items-center justify-center text-[#F5F2ED] shrink-0 overflow-hidden">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Cliente'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-[#A84F1F]" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#A84F1F]">
              {user
                ? isAdmin
                  ? 'CONTA ADMINISTRADOR'
                  : 'CLIENTE BARBERIA'
                : 'MODO VISITANTE'}
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-[#F5F2ED]">
              {userProfile?.displayName ||
                user?.displayName ||
                'Bem-vindo à BARBERIA'}
            </h1>
            <p className="text-xs text-[#A9A29B] mt-0.5">
              {user
                ? user.email
                : 'Entre com sua conta Google para sincronizar favoritos, simulações IA e histórico de agendamentos.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#582610] hover:bg-[#6B451F] text-[#F5F2ED] text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#A84F1F]" />
              <span>Abrir Painel Admin</span>
            </button>
          )}

          {user ? (
            <button
              onClick={logout}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-white/15 hover:border-white/30 text-[#A9A29B] hover:text-[#F5F2ED] text-xs font-medium flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da conta</span>
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="min-h-[48px] px-6 py-3 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] text-[#F5F2ED] text-xs md:text-sm font-bold flex items-center gap-2.5 shadow-lg transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar com Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Personal Data & Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSaveProfile}
          className="lg:col-span-7 rounded-2xl bg-[#14110F] border border-white/10 p-6 space-y-5"
        >
          <h2 className="font-display text-lg font-bold text-[#F5F2ED]">
            Meus Dados Pessoais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="profile-name"
                className="block text-xs text-[#A9A29B]"
              >
                Nome Completo
              </label>
              <input
                id="profile-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Seu nome"
                maxLength={100}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED] focus:outline-none focus:border-[#A84F1F]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="profile-phone"
                className="block text-xs text-[#A9A29B]"
              >
                Telefone / WhatsApp
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="(11) 99999-9999"
                maxLength={30}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm font-mono-num text-[#F5F2ED] focus:outline-none focus:border-[#A84F1F]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] text-xs font-semibold text-[#F5F2ED] flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Salvar dados</span>
          </button>
        </form>

        {/* Preferences */}
        <div className="lg:col-span-5 rounded-2xl bg-[#14110F] border border-white/10 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold text-[#F5F2ED]">
              Preferências do Aplicativo
            </h2>
            <p className="text-xs text-[#A9A29B]">
              Personalize a aparência visual e acesse o atendimento rápido da barbearia.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={toggleTheme}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#070605] border border-white/10 hover:border-[#A84F1F] flex items-center justify-between text-xs font-medium text-[#F5F2ED] transition-colors"
            >
              <span>Tema Visual</span>
              <span className="flex items-center gap-2 text-[#A84F1F] font-semibold">
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-4 h-4" /> Modo Escuro Luxury
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" /> Modo Claro Editorial
                  </>
                )}
              </span>
            </button>

            <a
              href={`https://wa.me/${businessSettings.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#582610]/50 hover:bg-[#582610] border border-[#A84F1F]/40 flex items-center justify-between text-xs font-semibold text-[#F5F2ED] transition-colors"
            >
              <span>Atendimento Direto BARBERIA</span>
              <span className="flex items-center gap-1.5 text-[#A84F1F]">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Upcoming & Historical Appointments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-[#14110F] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#F5F2ED] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#A84F1F]" />
              <span>Agendamentos Futuros</span>
            </h2>
            <span className="text-xs font-mono-num text-[#A9A29B]">
              {upcomingAppointments.length}
            </span>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#070605] border border-white/5 text-center space-y-3">
              <p className="text-xs text-[#A9A29B]">
                Você ainda não possui horários futuros agendados.
              </p>
              <button
                onClick={() => setActiveTab('booking')}
                className="min-h-[40px] px-4 py-2 rounded-lg bg-[#A84F1F] text-xs font-semibold text-[#F5F2ED]"
              >
                Agendar horário agora
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl bg-[#070605] border border-white/10 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 text-xs">
                    <p className="font-display text-sm font-bold text-[#F5F2ED]">
                      {apt.serviceName} · {apt.haircutName}
                    </p>
                    <p className="text-[#A9A29B]">
                      Barbeiro: <strong className="text-[#F5F2ED]">{apt.barberName}</strong>
                    </p>
                    <p className="font-mono-num text-[#A84F1F] font-semibold">
                      {apt.date} às {apt.time} · R$ {apt.servicePrice}
                    </p>
                  </div>

                  <button
                    onClick={() => cancelAppointment(apt.id)}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-500/50 text-xs text-[#A9A29B] hover:text-red-400 flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancelar</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-[#14110F] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#F5F2ED]">
              Histórico de Agendamentos
            </h2>
            <span className="text-xs font-mono-num text-[#A9A29B]">
              {pastAppointments.length}
            </span>
          </div>

          {pastAppointments.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#070605] border border-white/5 text-center">
              <p className="text-xs text-[#A9A29B]">
                Nenhum histórico anterior registrado.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl bg-[#070605] border border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-[#F5F2ED]">
                      {apt.serviceName} ({apt.haircutName})
                    </p>
                    <p className="font-mono-num text-[#A9A29B]">
                      {apt.date} · {apt.barberName}
                    </p>
                  </div>
                  <span className="text-[#A9A29B]">
                    {apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Favorite Cuts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-[#F5F2ED] flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#A84F1F]" />
            <span>Cortes Favoritos ({favoriteCuts.length})</span>
          </h2>
          <button
            onClick={() => setActiveTab('cuts')}
            className="text-xs text-[#A84F1F] hover:underline font-medium"
          >
            Explorar mais cortes
          </button>
        </div>

        {favoriteCuts.length === 0 ? (
          <div className="rounded-2xl bg-[#14110F] border border-white/10 p-8 text-center">
            <p className="text-sm text-[#A9A29B]">
              Você ainda não favoritou nenhum corte do catálogo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favoriteCuts.map((cut) => (
              <div
                key={cut.id}
                onClick={() => setActiveCutDetail(cut)}
                className="cursor-pointer rounded-2xl bg-[#14110F] border border-white/10 hover:border-[#A84F1F] overflow-hidden flex items-center gap-3.5 p-3 transition-colors"
              >
                <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0">
                  <ResilientImage
                    src={cut.imageUrl}
                    alt={cut.name}
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-bold text-[#F5F2ED] truncate">
                    {cut.name}
                  </p>
                  <p className="text-xs text-[#A9A29B]">{cut.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBookingWithCut(cut);
                      }}
                      className="text-xs font-semibold text-[#A84F1F] hover:underline"
                    >
                      Agendar
                    </button>
                    <span className="text-[#A9A29B]">·</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteCut(cut.id);
                      }}
                      className="text-xs text-[#A9A29B] hover:text-[#F5F2ED]"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved References & AI Generations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-[#14110F] border border-white/10 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#F5F2ED] flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#A84F1F]" />
            <span>Referências Salvas ({savedReferences.length})</span>
          </h2>

          {savedReferences.length === 0 ? (
            <p className="text-xs text-[#A9A29B]">
              Salve referências nos detalhes de qualquer corte para mostrar rapidamente ao seu barbeiro.
            </p>
          ) : (
            <div className="space-y-3">
              {savedReferences.map((ref) => (
                <div
                  key={ref.id}
                  className="p-3 rounded-xl bg-[#070605] border border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-14 rounded-lg overflow-hidden shrink-0">
                      <ResilientImage
                        src={ref.imageUrl}
                        alt={ref.haircutName}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#F5F2ED] truncate">
                        {ref.haircutName}
                      </p>
                      <p className="text-xs text-[#A9A29B] truncate">
                        {ref.notes}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSavedReference(ref.id)}
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center text-[#A9A29B] hover:text-red-400"
                    aria-label="Excluir referência"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-[#14110F] border border-white/10 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#F5F2ED] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#A84F1F]" />
            <span>Simulações Barber AI ({aiGenerations.length})</span>
          </h2>

          {aiGenerations.length === 0 ? (
            <p className="text-xs text-[#A9A29B]">
              Suas simulações salvas no Barber AI aparecerão aqui.
            </p>
          ) : (
            <div className="space-y-3">
              {aiGenerations.map((gen) => (
                <div
                  key={gen.id}
                  className="p-3 rounded-xl bg-[#070605] border border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={gen.previewDataUrl}
                      alt={gen.haircutName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-14 rounded-lg object-cover shrink-0 border border-white/10"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#F5F2ED] truncate">
                        {gen.haircutName} ·{' '}
                        <span className="text-[#A84F1F] font-mono-num">
                          {gen.compatibilityScore}%
                        </span>
                      </p>
                      <p className="text-xs text-[#A9A29B] truncate">
                        Rosto {gen.faceShape} · {gen.summary}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeAiGenerationRecord(gen.id)}
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center text-[#A9A29B] hover:text-red-400"
                    aria-label="Excluir simulação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
