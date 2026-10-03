import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Calendar,
  MapPin,
  MessageCircle,
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
  const cleanWhatsapp = (businessSettings.whatsapp || '552197507533').replace(
    /\D/g,
    ''
  );

  const scrollToLocation = () => {
    const el = document.getElementById('localizacao');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-14 md:space-y-20 pb-24"
    >
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[540px] md:min-h-[620px] flex items-end md:items-center overflow-hidden border-b border-white/10">
        <motion.div
          initial={{ scale: 1.06, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <ResilientImage
            src={HERO_IMAGE_PATH}
            alt="Interior da barbearia BARBERIA"
            className="w-full h-full"
          />
          {/* Measured Scrim for 4.5:1 WCAG AA legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070605] via-[#070605]/75 to-[#070605]/40 md:bg-gradient-to-r md:from-[#070605] md:via-[#070605]/85 md:to-transparent" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-8 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl space-y-5"
          >
            <p className="text-xs font-bold tracking-[0.2em] text-[#A84F1F]">
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
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('booking')}
                className="min-h-[48px] px-6 py-3.5 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] text-[#F5F2ED] text-sm font-bold flex items-center gap-2.5 shadow-lg transition-colors whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar horário</span>
              </motion.button>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('cuts')}
                className="min-h-[48px] px-6 py-3.5 rounded-xl bg-[#14110F]/90 hover:bg-[#14110F] border border-white/15 hover:border-white/30 text-[#F5F2ED] text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Scissors className="w-4 h-4 text-[#A84F1F]" />
                <span>Explorar cortes</span>
              </motion.button>

              <motion.a
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                  'Olá! Gostaria de agendar um horário na BARBEARIA.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] px-5 py-3.5 rounded-xl bg-[#582610]/70 hover:bg-[#582610] border border-[#A84F1F]/50 text-[#F5F2ED] text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-[#A84F1F]" />
                <span>WhatsApp (21) 9750-7533</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16 md:space-y-24">
        {/* 2. QUICK ACTIONS */}
        <section aria-label="Ações rápidas">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {[
              {
                sub: 'Reserva direta',
                title: 'Agendar',
                icon: Calendar,
                action: () => setActiveTab('booking'),
              },
              {
                sub: 'Catálogo visual',
                title: 'Ver cortes',
                icon: Scissors,
                action: () => setActiveTab('cuts'),
              },
              {
                sub: 'Simulador facial',
                title: 'Experimentar IA',
                icon: Sparkles,
                action: () => setActiveTab('ai'),
              },
              {
                sub: 'Mapa & rota',
                title: 'Como chegar',
                icon: MapPin,
                action: scrollToLocation,
              },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <motion.button
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.06 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.action}
                  className="p-4 md:p-5 rounded-2xl bg-[#14110F] border border-white/10 hover:border-[#A84F1F] text-left flex items-center justify-between group transition-colors"
                >
                  <div>
                    <span className="block text-xs text-[#A9A29B]">
                      {item.sub}
                    </span>
                    <span className="font-display text-base md:text-lg font-bold text-[#F5F2ED]">
                      {item.title}
                    </span>
                  </div>
                  <IconComp className="w-5 h-5 text-[#A84F1F] group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* 3. FEATURED CUTS */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#A84F1F] mb-1">
                CURADORIA BARBERIA
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#F5F2ED]">
                Tendências em destaque
              </h2>
              <p className="text-sm text-[#A9A29B] mt-1">
                Confira os cortes reais que estão fazendo sucesso na bancada.
              </p>
            </div>
            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('cuts')}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-white/15 hover:border-[#A84F1F] text-xs font-semibold text-[#F5F2ED] flex items-center gap-2 self-start sm:self-auto whitespace-nowrap transition-colors"
            >
              <span>Ver todos os cortes</span>
              <ArrowRight className="w-4 h-4 text-[#A84F1F]" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredCuts.map((cut, idx) => (
              <motion.article
                key={cut.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -6 }}
                onClick={() => setActiveCutDetail(cut)}
                className="group cursor-pointer rounded-2xl bg-[#14110F] border border-white/10 hover:border-[#A84F1F]/70 overflow-hidden flex flex-col justify-between transition-colors shadow-lg"
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
                      <span className="font-mono-num">
                        {cut.serviceDuration}
                      </span>
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
              </motion.article>
            ))}
          </div>
        </section>

        {/* 4. SERVICES SECTION (Editorial Numbering) */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#A84F1F] mb-1">
              ALFAIATARIA CAPILAR
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#F5F2ED]">
              Nossos serviços
            </h2>
          </div>

          <div className="divide-y divide-white/10 rounded-2xl bg-[#14110F] border border-white/10 overflow-hidden">
            {services.map((srv, idx) => (
              <motion.div
                key={srv.id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono-num text-xs text-[#A84F1F] font-bold">
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
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openBookingWithService(srv)}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] text-xs font-semibold text-[#F5F2ED] whitespace-nowrap transition-colors"
                  >
                    Agendar
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 5. AI VIRTUAL TRY-ON BANNER */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl bg-gradient-to-r from-[#582610] via-[#2A140B] to-[#14110F] border border-[#A84F1F]/40 p-6 md:p-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#A84F1F]">
                <Sparkles className="w-4 h-4" />
                <span>TECNOLOGIA EXCLUSIVA BARBER AI</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#F5F2ED]">
                Quer descobrir qual corte combina com você?
              </h2>
              <p className="text-sm md:text-base text-[#F5F2ED]/80 max-w-xl leading-relaxed">
                Escolha uma referência e veja uma simulação interativa usando sua própria foto com diagnóstico visagista do formato do seu rosto.
              </p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('ai')}
                className="min-h-[48px] px-6 py-3.5 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] text-[#F5F2ED] text-sm font-bold flex items-center gap-2 shadow-xl transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>Experimentar agora</span>
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* 6. BARBERS SECTION (No star ratings as requested) */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#A84F1F] mb-1">
              MESTRES DE BANCADA
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#F5F2ED]">
              Escolha seu barbeiro
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {barbers.map((barber, idx) => (
              <motion.div
                key={barber.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -5 }}
                className="group rounded-2xl bg-[#14110F] border border-white/10 hover:border-[#A84F1F]/60 overflow-hidden flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="aspect-square overflow-hidden">
                    <ResilientImage
                      src={barber.photoUrl}
                      alt={barber.name}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-display text-lg font-bold text-[#F5F2ED]">
                      {barber.name}
                    </h3>
                    <p className="text-xs text-[#A84F1F] font-semibold">
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
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => openBookingWithBarber(barber)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#A84F1F] hover:bg-[#8E4118] text-xs font-semibold text-[#F5F2ED] transition-colors"
                  >
                    Reservar
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 7. LOCATION & GOOGLE MAPS SECTION */}
        <MapSection />
      </div>
    </motion.div>
  );
};
