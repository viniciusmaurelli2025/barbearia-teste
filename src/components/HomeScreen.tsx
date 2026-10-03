import React from 'react';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Scissors,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HERO_IMAGE_PATH } from '../data/initialCatalog';
import { MapSection } from './MapSection';
import { ResilientImage } from './ResilientImage';

export const HomeScreen: React.FC = () => {
  const {
    businessSettings,
    haircuts,
    services,
    barbers,
    setActiveTab,
    setActiveCutDetail,
    openTryOnWithCut,
    openBookingWithCut,
    openBookingWithService,
    openBookingWithBarber,
  } = useApp();

  const featuredCuts = haircuts.filter((h) => h.featured).slice(0, 4);

  const scrollToLocation = () => {
    const el = document.getElementById('localizacao');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-14 md:space-y-20 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[540px] md:min-h-[620px] flex items-end md:items-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <ResilientImage
            src={HERO_IMAGE_PATH}
            alt="Interior da barbearia BARBERIA"
            className="w-full h-full"
          />
          {/* Measured Scrim for 4.5:1 WCAG AA legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070605] via-[#070605]/75 to-[#070605]/40 md:bg-gradient-to-r md:from-[#070605] md:via-[#070605]/85 md:to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-8 py-12 md:py-20">
          <div className="max-w-2xl space-y-5">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#A84F1F]">
              {businessSettings.heroEyebrow || 'BARBEARIA PREMIUM'}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#F5F2ED] leading-[1.08] tracking-tight">
              {businessSettings.heroTitle || 'Seu próximo corte começa aqui.'}
            </h1>
            <p className="text-base md:text-lg text-[#A9A29B] max-w-xl leading-relaxed">
              {businessSettings.heroDescription ||
                'Escolha seu estilo, visualize o resultado e agende seu horário.'}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-3">
              <button
                onClick={() => setActiveTab('booking')}
                className="min-h-[48px] px-6 py-3.5 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] active:scale-[0.98] text-[#F5F2ED] text-sm font-bold flex items-center gap-2.5 shadow-lg transition-all whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar horário</span>
              </button>

              <button
                onClick={() => setActiveTab('cuts')}
                className="min-h-[48px] px-6 py-3.5 rounded-xl bg-[#14110F]/90 hover:bg-[#14110F] border border-white/15 hover:border-white/30 text-[#F5F2ED] text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
              >
                <Scissors className="w-4 h-4 text-[#A84F1F]" />
                <span>Explorar cortes</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16 md:space-y-24">
        {/* 2. QUICK ACTIONS */}
        <section aria-label="Ações rápidas">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <button
              onClick={() => setActiveTab('booking')}
              className="p-4 md:p-5 rounded-2xl bg-[#14110F] border border-white/10 hover:border-[#A84F1F] text-left flex items-center justify-between group transition-colors"
            >
              <div>
                <span className="block text-xs text-[#A9A29B]">Reserva direta</span>
                <span className="font-display text-base md:text-lg font-bold text-[#F5F2ED]">
                  Agendar
                </span>
              </div>
              <Calendar className="w-5 h-5 text-[#A84F1F] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setActiveTab('cuts')}
              className="p-4 md:p-5 rounded-2xl bg-[#14110F] border border-white/10 hover:border-[#A84F1F] text-left flex items-center justify-between group transition-colors"
            >
              <div>
                <span className="block text-xs text-[#A9A29B]">Catálogo visual</span>
                <span className="font-display text-base md:text-lg font-bold text-[#F5F2ED]">
                  Ver cortes
                </span>
              </div>
              <Scissors className="w-5 h-5 text-[#A84F1F] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className="p-4 md:p-5 rounded-2xl bg-[#14110F] border border-white/10 hover:border-[#A84F1F] text-left flex items-center justify-between group transition-colors"
            >
              <div>
                <span className="block text-xs text-[#A9A29B]">Simulador facial</span>
                <span className="font-display text-base md:text-lg font-bold text-[#F5F2ED]">
                  Experimentar IA
                </span>
              </div>
              <Sparkles className="w-5 h-5 text-[#A84F1F] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={scrollToLocation}
              className="p-4 md:p-5 rounded-2xl bg-[#14110F] border border-white/10 hover:border-[#A84F1F] text-left flex items-center justify-between group transition-colors"
            >
              <div>
                <span className="block text-xs text-[#A9A29B]">Mapa & rota</span>
                <span className="font-display text-base md:text-lg font-bold text-[#F5F2ED]">
                  Como chegar
                </span>
              </div>
              <MapPin className="w-5 h-5 text-[#A84F1F] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </section>

        {/* 3. FEATURED CUTS */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-widest text-[#A84F1F] mb-1">
                CURADORIA BARBERIA
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#F5F2ED]">
                Tendências em destaque
              </h2>
              <p className="text-sm text-[#A9A29B] mt-1">
                Confira os cortes que estão fazendo sucesso.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('cuts')}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-white/15 hover:border-[#A84F1F] text-xs font-semibold text-[#F5F2ED] flex items-center gap-2 self-start sm:self-auto whitespace-nowrap transition-colors"
            >
              <span>Ver todos os cortes</span>
              <ArrowRight className="w-4 h-4 text-[#A84F1F]" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredCuts.map((cut) => (
              <article
                key={cut.id}
                onClick={() => setActiveCutDetail(cut)}
                className="group cursor-pointer rounded-2xl bg-[#14110F] border border-white/10 hover:border-[#A84F1F]/60 overflow-hidden flex flex-col justify-between transition-all"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <ResilientImage
                    src={cut.imageUrl}
                    alt={cut.name}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070605] via-transparent to-transparent opacity-85" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="text-xs text-[#A9A29B] mb-0.5">
                      <span>{cut.category}</span>
                      <span className="mx-1.5">·</span>
                      <span>{cut.length}</span>
                      <span className="mx-1.5">·</span>
                      <span className="font-mono-num">{cut.serviceDuration}</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-[#F5F2ED]">
                      {cut.name}
                    </h3>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-[#A9A29B] line-clamp-2">
                    {cut.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openTryOnWithCut(cut);
                      }}
                      className="min-h-[40px] px-3 py-2 rounded-xl bg-[#070605] hover:bg-[#582610] border border-white/10 text-xs font-medium text-[#F5F2ED] flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#A84F1F]" />
                      <span>IA</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBookingWithCut(cut);
                      }}
                      className="min-h-[40px] px-3 py-2 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] text-xs font-semibold text-[#F5F2ED] flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Agendar</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 4. SERVICES SECTION (Editorial Numbering) */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-medium tracking-widest text-[#A84F1F] mb-1">
              ALFAIATARIA CAPILAR
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#F5F2ED]">
              Nossos serviços
            </h2>
          </div>

          <div className="divide-y divide-white/10 rounded-2xl bg-[#14110F] border border-white/10 overflow-hidden">
            {services.map((srv, idx) => (
              <div
                key={srv.id}
                className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono-num text-xs text-[#A84F1F] font-semibold">
                      0{idx + 1}.
                    </span>
                    <h3 className="font-display text-lg font-bold text-[#F5F2ED]">
                      {srv.name}
                    </h3>
                    <span className="text-xs text-[#A9A29B] font-mono-num">
                      · {srv.duration}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-[#A9A29B] pl-7">
                    {srv.description}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 pl-7 sm:pl-0">
                  <span className="font-mono-num text-xl font-bold text-[#F5F2ED]">
                    R$ {srv.price}
                  </span>
                  <button
                    onClick={() => openBookingWithService(srv)}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] text-xs font-semibold text-[#F5F2ED] whitespace-nowrap transition-colors"
                  >
                    Agendar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. AI VIRTUAL TRY-ON BANNER */}
        <section className="rounded-2xl bg-gradient-to-r from-[#582610] via-[#2A140B] to-[#14110F] border border-[#A84F1F]/40 p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#A84F1F]">
                <Sparkles className="w-4 h-4" />
                <span>TECNOLOGIA EXCLUSIVA BARBER AI</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#F5F2ED]">
                Quer descobrir qual corte combina com você?
              </h2>
              <p className="text-sm md:text-base text-[#F5F2ED]/80 max-w-xl leading-relaxed">
                Escolha uma referência e veja uma simulação usando sua própria foto com diagnóstico visagista do formato do seu rosto.
              </p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <button
                onClick={() => setActiveTab('ai')}
                className="min-h-[48px] px-6 py-3.5 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] text-[#F5F2ED] text-sm font-bold flex items-center gap-2 shadow-xl transition-all whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>Experimentar agora</span>
              </button>
            </div>
          </div>
        </section>

        {/* 6. BARBERS SECTION */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-medium tracking-widest text-[#A84F1F] mb-1">
              MESTRES DE BANCADA
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#F5F2ED]">
              Escolha seu barbeiro
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="rounded-2xl bg-[#14110F] border border-white/10 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square overflow-hidden">
                    <ResilientImage
                      src={barber.photoUrl}
                      alt={barber.name}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-[#F5F2ED]">
                        {barber.name}
                      </h3>
                      <span className="text-xs font-mono-num text-[#A84F1F] font-semibold">
                        ★ {barber.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-[#A84F1F] font-medium">
                      {barber.roleTitle}
                    </p>
                    <p className="text-xs text-[#A9A29B] line-clamp-2 leading-relaxed">
                      {barber.bio}
                    </p>
                    <p className="text-[11px] text-[#F5F2ED]/80 pt-1">
                      {barber.specialties.join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono-num text-[#A9A29B]">
                    Livre: {barber.nextAvailable}
                  </span>
                  <button
                    onClick={() => openBookingWithBarber(barber)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#A84F1F] hover:bg-[#8E4118] text-xs font-semibold text-[#F5F2ED] transition-colors"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. LOCATION & GOOGLE MAPS SECTION */}
        <MapSection />
      </div>
    </div>
  );
};
