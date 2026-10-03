import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Database,
  DollarSign,
  Plus,
  Save,
  Scissors,
  Settings,
  ShieldAlert,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  CUT_FADE_IMG,
  HAIRCUT_CATEGORIES,
} from '../data/initialCatalog';
import {
  Barber,
  BusinessSettings,
  HairLength,
  Haircut,
  MaintenanceLevel,
  ServiceItem,
} from '../types';
import { ResilientImage } from './ResilientImage';

type AdminSubTab =
  | 'dashboard'
  | 'appointments'
  | 'services'
  | 'barbers'
  | 'cuts'
  | 'settings';

export const AdminPanelScreen: React.FC = () => {
  const {
    user,
    isAdmin,
    signInWithGoogle,
    appointments,
    services,
    barbers,
    haircuts,
    businessSettings,
    saveBusinessSettingsAdmin,
    saveServiceAdmin,
    deleteServiceAdmin,
    saveBarberAdmin,
    deleteBarberAdmin,
    saveHaircutAdmin,
    deleteHaircutAdmin,
    updateAppointmentStatusAdmin,
    seedInitialCatalogToFirestore,
  } = useApp();

  const [subTab, setSubTab] = useState<AdminSubTab>('dashboard');

  // Business Settings Local Form
  const [settingsForm, setSettingsForm] =
    useState<BusinessSettings>(businessSettings);
  const [blockedInput, setBlockedInput] = useState(
    (businessSettings.blockedSlots || []).join(', ')
  );

  // New Service Form
  const [srvName, setSrvName] = useState('');
  const [srvDuration, setSrvDuration] = useState('40 min');
  const [srvPrice, setSrvPrice] = useState('85');
  const [srvDesc, setSrvDesc] = useState('');

  // New Barber Form
  const [brbName, setBrbName] = useState('');
  const [brbRole, setBrbRole] = useState('Master Barber');
  const [brbSpecialties, setBrbSpecialties] = useState('Fade, Clássicos');
  const [brbHours, setBrbHours] = useState(
    '09:00, 10:00, 11:00, 14:00, 15:00, 16:00, 17:00, 18:00'
  );
  const [brbWhatsapp, setBrbWhatsapp] = useState(businessSettings.whatsapp);

  // New Haircut Form
  const [cutName, setCutName] = useState('');
  const [cutCat, setCutCat] = useState('Fade');
  const [cutLength, setCutLength] = useState<HairLength>('Curto');
  const [cutMaintenance, setCutMaintenance] =
    useState<MaintenanceLevel>('Média');
  const [cutDesc, setCutDesc] = useState('');
  const [cutImg, setCutImg] = useState(CUT_FADE_IMG);
  const [cutFeatured, setCutFeatured] = useState(true);

  if (!user || !isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#582610]/40 border border-[#A84F1F] flex items-center justify-center mx-auto text-[#A84F1F]">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[#F5F2ED]">
          Acesso Restrito à Administração
        </h1>
        <p className="text-sm text-[#A9A29B]">
          Faça login com a conta de administrador da barbearia para gerenciar preços, barbeiros, cortes, horários e configurações do WhatsApp.
        </p>
        {!user && (
          <button
            onClick={signInWithGoogle}
            className="min-h-[48px] px-6 py-3 rounded-xl bg-[#A84F1F] text-[#F5F2ED] text-sm font-bold"
          >
            Entrar com Google
          </button>
        )}
      </div>
    );
  }

  const confirmedCount = appointments.filter(
    (a) => a.status === 'confirmed'
  ).length;
  const totalRevenue = appointments
    .filter((a) => a.status !== 'cancelled')
    .reduce((acc, a) => acc + (Number(a.servicePrice) || 0), 0);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const blockedArray = blockedInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    await saveBusinessSettingsAdmin({
      ...settingsForm,
      blockedSlots: blockedArray,
    });
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName.trim()) return;
    await saveServiceAdmin({
      id: `srv_${Date.now()}`,
      name: srvName.trim(),
      description: srvDesc.trim() || 'Atendimento premium BARBERIA.',
      duration: srvDuration.trim(),
      price: Number(srvPrice) || 80,
      category: 'Personalizado',
      isPublic: true,
    });
    setSrvName('');
    setSrvDesc('');
  };

  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brbName.trim()) return;
    await saveBarberAdmin({
      id: `brb_${Date.now()}`,
      name: brbName.trim(),
      roleTitle: brbRole.trim(),
      bio: 'Especialista credenciado da equipe BARBERIA.',
      photoUrl: CUT_FADE_IMG,
      specialties: brbSpecialties
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      rating: 5.0,
      completedCuts: 500,
      availableHours: brbHours
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean),
      whatsapp: brbWhatsapp.trim(),
      nextAvailable: 'Hoje, 15:00',
      isPublic: true,
    });
    setBrbName('');
  };

  const handleAddHaircut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cutName.trim()) return;
    await saveHaircutAdmin({
      id: `cut_${Date.now()}`,
      name: cutName.trim(),
      category: cutCat,
      length: cutLength,
      style: 'Editorial BARBERIA',
      description:
        cutDesc.trim() || 'Corte masculino com acabamento de precisão.',
      maintenanceLevel: cutMaintenance,
      recommendedHairType: 'Todos os tipos de cabelo',
      serviceDuration: '40 min',
      imageUrl: cutImg.trim() || CUT_FADE_IMG,
      barberIds: barbers.map((b) => b.id),
      featured: cutFeatured,
      isPublic: true,
    });
    setCutName('');
    setCutDesc('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8 pb-28">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#A84F1F]">
            GESTÃO COMPLETA SEM CÓDIGO
          </p>
          <h1 className="font-display text-3xl font-bold text-[#F5F2ED]">
            Painel Administrativo · {businessSettings.shopName}
          </h1>
        </div>

        <button
          onClick={seedInitialCatalogToFirestore}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#582610] hover:bg-[#6B451F] text-[#F5F2ED] text-xs font-semibold flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <Database className="w-4 h-4 text-[#A84F1F]" />
          <span>Sincronizar Catálogo Padrão no Cloud Firestore</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'appointments', label: `Agendamentos (${appointments.length})` },
          { id: 'services', label: `Serviços & Preços (${services.length})` },
          { id: 'barbers', label: `Barbeiros & Horários (${barbers.length})` },
          { id: 'cuts', label: `Catálogo de Cortes (${haircuts.length})` },
          { id: 'settings', label: 'Dados, Banners & WhatsApp' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id as AdminSubTab)}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              subTab === t.id
                ? 'bg-[#A84F1F] text-[#F5F2ED]'
                : 'bg-[#14110F] border border-white/10 text-[#A9A29B] hover:text-[#F5F2ED]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. DASHBOARD */}
      {subTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#14110F] border border-white/10 space-y-1">
              <span className="text-xs text-[#A9A29B]">
                Agendamentos Confirmados
              </span>
              <p className="font-mono-num text-3xl font-bold text-[#F5F2ED]">
                {confirmedCount}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#14110F] border border-white/10 space-y-1">
              <span className="text-xs text-[#A9A29B]">Receita Estimada</span>
              <p className="font-mono-num text-3xl font-bold text-[#A84F1F]">
                R$ {totalRevenue}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#14110F] border border-white/10 space-y-1">
              <span className="text-xs text-[#A9A29B]">Cortes no Catálogo</span>
              <p className="font-mono-num text-3xl font-bold text-[#F5F2ED]">
                {haircuts.length}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#14110F] border border-white/10 space-y-1">
              <span className="text-xs text-[#A9A29B]">Barbeiros Ativos</span>
              <p className="font-mono-num text-3xl font-bold text-[#F5F2ED]">
                {barbers.length}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#14110F] border border-white/10 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-[#F5F2ED]">
              Ações Rápidas de Administração
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setSubTab('services')}
                className="p-4 rounded-xl bg-[#070605] border border-white/10 hover:border-[#A84F1F] text-left flex items-center gap-3"
              >
                <DollarSign className="w-5 h-5 text-[#A84F1F]" />
                <div>
                  <p className="text-sm font-bold text-[#F5F2ED]">
                    Atualizar Preços
                  </p>
                  <p className="text-xs text-[#A9A29B]">
                    Editar valores e tempos de serviço
                  </p>
                </div>
              </button>
              <button
                onClick={() => setSubTab('cuts')}
                className="p-4 rounded-xl bg-[#070605] border border-white/10 hover:border-[#A84F1F] text-left flex items-center gap-3"
              >
                <Scissors className="w-5 h-5 text-[#A84F1F]" />
                <div>
                  <p className="text-sm font-bold text-[#F5F2ED]">
                    Cadastrar Novo Corte
                  </p>
                  <p className="text-xs text-[#A9A29B]">
                    Adicionar fotos e referências
                  </p>
                </div>
              </button>
              <button
                onClick={() => setSubTab('settings')}
                className="p-4 rounded-xl bg-[#070605] border border-white/10 hover:border-[#A84F1F] text-left flex items-center gap-3"
              >
                <Settings className="w-5 h-5 text-[#A84F1F]" />
                <div>
                  <p className="text-sm font-bold text-[#F5F2ED]">
                    Configurar WhatsApp & Endereço
                  </p>
                  <p className="text-xs text-[#A9A29B]">
                    Personalizar mensagens e horários bloqueados
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MANAGE APPOINTMENTS & CLIENTS */}
      {subTab === 'appointments' && (
        <div className="rounded-2xl bg-[#14110F] border border-white/10 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#F5F2ED] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#A84F1F]" />
            <span>Gerenciar Agendamentos & Clientes</span>
          </h2>

          {appointments.length === 0 ? (
            <p className="text-sm text-[#A9A29B]">
              Nenhum agendamento registrado até o momento.
            </p>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl bg-[#070605] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <p className="font-display text-sm font-bold text-[#F5F2ED]">
                      {apt.customerName} ·{' '}
                      <span className="font-mono-num text-[#A84F1F]">
                        {apt.customerPhone}
                      </span>
                    </p>
                    <p className="text-[#A9A29B]">
                      Serviço: <strong className="text-[#F5F2ED]">{apt.serviceName}</strong> ·
                      Corte: <strong className="text-[#F5F2ED]">{apt.haircutName}</strong> ·
                      Barbeiro: <strong className="text-[#F5F2ED]">{apt.barberName}</strong>
                    </p>
                    <p className="font-mono-num text-[#A9A29B]">
                      {apt.date} às {apt.time} · R$ {apt.servicePrice} · Status:{' '}
                      <strong className="text-[#F5F2ED]">{apt.status}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateAppointmentStatusAdmin(apt.id, 'completed')
                      }
                      className="min-h-[38px] px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs font-medium flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Concluir</span>
                    </button>
                    <button
                      onClick={() =>
                        updateAppointmentStatusAdmin(apt.id, 'cancelled')
                      }
                      className="min-h-[38px] px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800/50 text-red-300 text-xs font-medium flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. MANAGE SERVICES & PRICES */}
      {subTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleAddService}
            className="lg:col-span-5 rounded-2xl bg-[#14110F] border border-white/10 p-6 space-y-4"
          >
            <h2 className="font-display text-lg font-bold text-[#F5F2ED]">
              Adicionar Novo Serviço
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                value={srvName}
                onChange={(e) => setSrvName(e.target.value)}
                placeholder="Nome do serviço (ex: Platinado + Corte)"
                required
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={srvPrice}
                  onChange={(e) => setSrvPrice(e.target.value)}
                  placeholder="Preço R$"
                  required
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm font-mono-num text-[#F5F2ED]"
                />
                <input
                  type="text"
                  value={srvDuration}
                  onChange={(e) => setSrvDuration(e.target.value)}
                  placeholder="Duração (ex: 45 min)"
                  required
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED]"
                />
              </div>
              <textarea
                value={srvDesc}
                onChange={(e) => setSrvDesc(e.target.value)}
                placeholder="Descrição do serviço..."
                rows={3}
                className="w-full p-3.5 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED]"
              />
              <button
                type="submit"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#A84F1F] text-xs font-bold text-[#F5F2ED] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar Serviço</span>
              </button>
            </div>
          </form>

          <div className="lg:col-span-7 rounded-2xl bg-[#14110F] border border-white/10 p-6 space-y-3">
            <h2 className="font-display text-lg font-bold text-[#F5F2ED]">
              Serviços Ativos (Edição Rápida de Preço)
            </h2>
            {services.map((srv) => (
              <div
                key={srv.id}
                className="p-4 rounded-xl bg-[#070605] border border-white/10 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-sm text-[#F5F2ED]">{srv.name}</p>
                  <p className="text-xs text-[#A9A29B] font-mono-num">
                    {srv.duration} · R$ {srv.price}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      saveServiceAdmin({ ...srv, price: srv.price + 5 })
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-white/15 text-xs font-mono-num text-[#F5F2ED]"
                  >
                    +R$5
                  </button>
                  <button
                    onClick={() =>
                      saveServiceAdmin({
                        ...srv,
                        price: Math.max(10, srv.price - 5),
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-white/15 text-xs font-mono-num text-[#F5F2ED]"
                  >
                    -R$5
                  </button>
                  <button
                    onClick={() => deleteServiceAdmin(srv.id)}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#A9A29B] hover:text-red-400"
                    aria-label="Remover serviço"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MANAGE BARBERS & HOURS */}
      {subTab === 'barbers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleAddBarber}
            className="lg:col-span-5 rounded-2xl bg-[#14110F] border border-white/10 p-6 space-y-4"
          >
            <h2 className="font-display text-lg font-bold text-[#F5F2ED]">
              Cadastrar Barbeiro
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                value={brbName}
                onChange={(e) => setBrbName(e.target.value)}
                placeholder="Nome do barbeiro"
                required
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED]"
              />
              <input
                type="text"
                value={brbRole}
                onChange={(e) => setBrbRole(e.target.value)}
                placeholder="Título / Cargo"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED]"
              />
              <input
                type="text"
                value={brbSpecialties}
                onChange={(e) => setBrbSpecialties(e.target.value)}
                placeholder="Especialidades separadas por vírgula"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED]"
              />
              <input
                type="text"
                value={brbHours}
                onChange={(e) => setBrbHours(e.target.value)}
                placeholder="Horários (ex: 09:00, 10:00, 14:00)"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm font-mono-num text-[#F5F2ED]"
              />
              <input
                type="text"
                value={brbWhatsapp}
                onChange={(e) => setBrbWhatsapp(e.target.value)}
                placeholder="WhatsApp do Barbeiro"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm font-mono-num text-[#F5F2ED]"
              />
              <button
                type="submit"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#A84F1F] text-xs font-bold text-[#F5F2ED] flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Adicionar Barbeiro</span>
              </button>
            </div>
          </form>

          <div className="lg:col-span-7 rounded-2xl bg-[#14110F] border border-white/10 p-6 space-y-3">
            <h2 className="font-display text-lg font-bold text-[#F5F2ED]">
              Equipe de Barbeiros
            </h2>
            {barbers.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-[#070605] border border-white/10 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <ResilientImage
                      src={b.photoUrl}
                      alt={b.name}
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#F5F2ED]">{b.name}</p>
                    <p className="text-xs text-[#A9A29B]">
                      {b.specialties.join(' · ')}
                    </p>
                    <p className="text-[11px] font-mono-num text-[#A84F1F]">
                      Horários: {b.availableHours.join(', ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteBarberAdmin(b.id)}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#A9A29B] hover:text-red-400"
                  aria-label="Remover barbeiro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. MANAGE HAIRCUTS CATALOG */}
      {subTab === 'cuts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleAddHaircut}
            className="lg:col-span-5 rounded-2xl bg-[#14110F] border border-white/10 p-6 space-y-4"
          >
            <h2 className="font-display text-lg font-bold text-[#F5F2ED]">
              Cadastrar Novo Corte no Catálogo
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                value={cutName}
                onChange={(e) => setCutName(e.target.value)}
                placeholder="Nome do corte (ex: Mid Drop Fade)"
                required
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED]"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={cutCat}
                  onChange={(e) => setCutCat(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#070605] border border-white/15 text-xs text-[#F5F2ED]"
                >
                  {HAIRCUT_CATEGORIES.filter((c) => c !== 'Todos').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={cutLength}
                  onChange={(e) => setCutLength(e.target.value as HairLength)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#070605] border border-white/15 text-xs text-[#F5F2ED]"
                >
                  <option value="Curto">Curto</option>
                  <option value="Médio">Médio</option>
                  <option value="Longo">Longo</option>
                </select>
              </div>
              <select
                value={cutMaintenance}
                onChange={(e) =>
                  setCutMaintenance(e.target.value as MaintenanceLevel)
                }
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#070605] border border-white/15 text-xs text-[#F5F2ED]"
              >
                <option value="Baixa">Manutenção Baixa</option>
                <option value="Média">Manutenção Média</option>
                <option value="Alta">Manutenção Alta</option>
              </select>
              <input
                type="text"
                value={cutImg}
                onChange={(e) => setCutImg(e.target.value)}
                placeholder="URL da foto do corte"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-xs text-[#F5F2ED]"
              />
              <textarea
                value={cutDesc}
                onChange={(e) => setCutDesc(e.target.value)}
                placeholder="Descrição técnica e visual do corte..."
                rows={3}
                className="w-full p-3.5 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED]"
              />
              <label className="flex items-center gap-2 text-xs text-[#A9A29B]">
                <input
                  type="checkbox"
                  checked={cutFeatured}
                  onChange={(e) => setCutFeatured(e.target.checked)}
                />
                <span>Destacar na tela inicial (Tendências)</span>
              </label>
              <button
                type="submit"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#A84F1F] text-xs font-bold text-[#F5F2ED] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Corte</span>
              </button>
            </div>
          </form>

          <div className="lg:col-span-7 rounded-2xl bg-[#14110F] border border-white/10 p-6 space-y-3 max-h-[600px] overflow-y-auto">
            <h2 className="font-display text-lg font-bold text-[#F5F2ED]">
              Cortes Cadastrados ({haircuts.length})
            </h2>
            {haircuts.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-[#070605] border border-white/10 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-14 rounded-lg overflow-hidden shrink-0">
                    <ResilientImage
                      src={c.imageUrl}
                      alt={c.name}
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#F5F2ED]">{c.name}</p>
                    <p className="text-xs text-[#A9A29B]">
                      {c.category} · {c.length} · Manutenção {c.maintenanceLevel}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteHaircutAdmin(c.id)}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#A9A29B] hover:text-red-400"
                  aria-label="Excluir corte"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. BUSINESS SETTINGS, BANNERS, BLOCKED SLOTS & WHATSAPP */}
      {subTab === 'settings' && (
        <form
          onSubmit={handleSaveSettings}
          className="rounded-2xl bg-[#14110F] border border-white/10 p-6 md:p-8 space-y-6"
        >
          <h2 className="font-display text-xl font-bold text-[#F5F2ED]">
            Configurações da Barbearia, Banners, Horários Bloqueados e WhatsApp
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-[#A9A29B]">Nome da Barbearia</label>
              <input
                type="text"
                value={settingsForm.shopName}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, shopName: e.target.value })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#A9A29B]">
                WhatsApp Principal (apenas números com DDI 55)
              </label>
              <input
                type="text"
                value={settingsForm.whatsapp}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, whatsapp: e.target.value })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm font-mono-num text-[#F5F2ED]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#A9A29B]">Telefone Exibido</label>
              <input
                type="text"
                value={settingsForm.phone}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, phone: e.target.value })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm font-mono-num text-[#F5F2ED]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#A9A29B]">Instagram</label>
              <input
                type="text"
                value={settingsForm.instagram}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    instagram: e.target.value,
                  })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED]"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-[#A9A29B]">Endereço Completo</label>
              <input
                type="text"
                value={settingsForm.address}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, address: e.target.value })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#A9A29B]">
                Horário de Funcionamento
              </label>
              <input
                type="text"
                value={settingsForm.openingHours}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    openingHours: e.target.value,
                  })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#A9A29B]">
                Bloquear Horários (separados por vírgula, ex: 12:30, 13:00)
              </label>
              <input
                type="text"
                value={blockedInput}
                onChange={(e) => setBlockedInput(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm font-mono-num text-[#F5F2ED]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#A9A29B]">
                Título do Banner Principal (Hero)
              </label>
              <input
                type="text"
                value={settingsForm.heroTitle}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    heroTitle: e.target.value,
                  })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#A9A29B]">
                Subtítulo do Banner Principal
              </label>
              <input
                type="text"
                value={settingsForm.heroDescription}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    heroDescription: e.target.value,
                  })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED]"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-[#A9A29B]">
                Template da Mensagem do WhatsApp (Variáveis: {'{customer_name}'},{' '}
                {'{service}'}, {'{haircut}'}, {'{barber}'}, {'{date}'},{' '}
                {'{time}'})
              </label>
              <textarea
                value={settingsForm.whatsappTemplate}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    whatsappTemplate: e.target.value,
                  })
                }
                rows={5}
                className="w-full p-3.5 rounded-xl bg-[#070605] border border-white/15 text-xs font-mono-num text-[#F5F2ED]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="min-h-[48px] px-6 py-3 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] text-xs font-bold text-[#F5F2ED] flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Todas as Configurações</span>
          </button>
        </form>
      )}
    </div>
  );
};
