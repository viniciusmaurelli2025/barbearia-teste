import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Copy,
  Edit3,
  MessageCircle,
  Phone,
  Scissors,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_PHONE_DISPLAY, DEFAULT_WHATSAPP_NUMBER } from '../data/initialCatalog';
import { ResilientImage } from './ResilientImage';

interface DayOption {
  iso: string;
  dayName: string;
  dayNumber: string;
  monthShort: string;
  labelFull: string;
}

function generateNext10Days(): DayOption[] {
  const days: DayOption[] = [];
  const weekNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  const base = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    if (d.getDay() === 0) continue;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;
    const dayName = i === 0 ? 'Hoje' : weekNames[d.getDay()];
    const monthShort = monthNames[d.getMonth()];
    const labelFull = `${dd}/${mm}/${yyyy} (${weekNames[d.getDay()]})`;

    days.push({
      iso,
      dayName,
      dayNumber: dd,
      monthShort,
      labelFull,
    });
    if (days.length >= 8) break;
  }
  return days;
}

export const BookingScreen: React.FC = () => {
  const {
    services,
    barbers,
    haircuts,
    businessSettings,
    appointments,
    user,
    userProfile,
    userPrivateInfo,
    selectedCutForBooking,
    setSelectedCutForBooking,
    selectedServiceForBooking,
    setSelectedServiceForBooking,
    selectedBarberForBooking,
    setSelectedBarberForBooking,
    createBookingAppointment,
    showToast,
  } = useApp();

  const availableDays = useMemo(() => generateNext10Days(), []);

  const [step, setStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(
    availableDays[0]?.iso || ''
  );
  const [selectedTime, setSelectedTime] = useState<string>('14:00');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    whatsappUrl: string;
    formattedMessage: string;
    phoneDisplay: string;
  } | null>(null);

  const activeService = selectedServiceForBooking || services[0];
  const activeBarber = selectedBarberForBooking || barbers[0];
  const activeCut = selectedCutForBooking || haircuts[0];

  useEffect(() => {
    if (userProfile?.displayName && !customerName) {
      setCustomerName(userProfile.displayName);
    }
    if (userPrivateInfo?.phone && !customerPhone) {
      setCustomerPhone(userPrivateInfo.phone);
    }
  }, [userProfile, userPrivateInfo]);

  const selectedDayObj =
    availableDays.find((d) => d.iso === selectedDate) || availableDays[0];

  const unavailableTimes = useMemo(() => {
    const blocked = new Set<string>(businessSettings.blockedSlots || []);
    appointments.forEach((apt) => {
      if (
        apt.barberId === activeBarber?.id &&
        apt.date === selectedDayObj?.labelFull &&
        apt.status !== 'cancelled'
      ) {
        blocked.add(apt.time);
      }
    });
    return blocked;
  }, [businessSettings.blockedSlots, appointments, activeBarber, selectedDayObj]);

  const allSlotsForBarber = useMemo(() => {
    const baseSlots =
      activeBarber?.availableHours?.length > 0
        ? activeBarber.availableHours
        : ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    const merged = Array.from(
      new Set([...baseSlots, ...(businessSettings.blockedSlots || [])])
    ).sort();
    return merged;
  }, [activeBarber, businessSettings.blockedSlots]);

  const buildWhatsappMessage = () => {
    const template =
      businessSettings.whatsappTemplate ||
      'Olá! Gostaria de confirmar meu agendamento na BARBEARIA.\n\nNome: {customer_name}\nServiço: {service}\nCorte: {haircut}\nBarbeiro: {barber}\nData: {date}\nHorário: {time}\n\nEnviado pelo aplicativo da BARBEARIA.';

    return template
      .replace(/%0A/g, '\n')
      .replace('{customer_name}', customerName.trim())
      .replace('{service}', activeService.name)
      .replace('{haircut}', activeCut.name)
      .replace('{barber}', activeBarber.name)
      .replace('{date}', selectedDayObj?.labelFull || selectedDate)
      .replace('{time}', selectedTime);
  };

  const handleNextStep = () => {
    setFormError(null);
    if (step === 3 && !selectedTime) {
      setFormError('Selecione um horário disponível para continuar.');
      return;
    }
    if (step === 4) {
      if (customerName.trim().length < 2) {
        setFormError('Informe seu nome completo para o agendamento.');
        return;
      }
      const digits = customerPhone.replace(/\D/g, '');
      if (digits.length < 10) {
        setFormError(
          'Informe um telefone/WhatsApp válido com DDD (ex: 21 9750-7533).'
        );
        return;
      }
    }
    setStep((prev) => Math.min(5, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmBooking = async () => {
    const message = buildWhatsappMessage();
    const targetPhone = (
      businessSettings.whatsapp ||
      activeBarber.whatsapp ||
      DEFAULT_WHATSAPP_NUMBER
    ).replace(/\D/g, '');

    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(
      message
    )}`;

    await createBookingAppointment({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      serviceId: activeService.id,
      serviceName: activeService.name,
      servicePrice: activeService.price,
      barberId: activeBarber.id,
      barberName: activeBarber.name,
      haircutId: activeCut.id,
      haircutName: activeCut.name,
      date: selectedDayObj?.labelFull || selectedDate,
      time: selectedTime,
    });

    setConfirmedBooking({
      whatsappUrl,
      formattedMessage: message,
      phoneDisplay: businessSettings.phone || DEFAULT_PHONE_DISPLAY,
    });
  };

  const handleCopyMessage = async () => {
    if (!confirmedBooking) return;
    try {
      await navigator.clipboard.writeText(confirmedBooking.formattedMessage);
      showToast('Mensagem de agendamento copiada!');
    } catch {
      showToast('Copie o texto abaixo manualmente.', 'info');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8 pb-28"
    >
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-[#A84F1F] mb-1">
            RESERVA RÁPIDA · 5 ETAPAS
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#F5F2ED]">
            Agende seu horário.
          </h1>
          <p className="text-sm text-[#A9A29B] mt-1">
            Escolha o melhor horário para você e confirme diretamente no WhatsApp (21) 9750-7533.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => {
                if (num < step) setStep(num);
              }}
              disabled={num > step}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                num === step
                  ? 'w-8 bg-[#A84F1F]'
                  : num < step
                  ? 'w-4 bg-[#6B451F] cursor-pointer'
                  : 'w-2.5 bg-white/15'
              }`}
              aria-label={`Etapa ${num}`}
            />
          ))}
          <span className="ml-2 text-xs font-mono-num text-[#A9A29B]">
            {step}/5
          </span>
        </div>
      </div>

      {/* Confirmed Booking & WhatsApp Dispatch Screen */}
      <AnimatePresence mode="wait">
        {confirmedBooking ? (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-[#14110F] border border-[#A84F1F] p-6 md:p-8 space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#A84F1F]/20 border border-[#A84F1F] flex items-center justify-center text-[#A84F1F]">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#A84F1F]">
                  AGENDAMENTO PRONTO
                </span>
                <h2 className="font-display text-2xl font-bold text-[#F5F2ED]">
                  Envie sua confirmação pelo WhatsApp
                </h2>
              </div>
            </div>

            <p className="text-sm text-[#A9A29B]">
              Seu horário foi pré-reservado. Toque no botão abaixo para abrir o
              WhatsApp da <strong className="text-[#F5F2ED]">{businessSettings.shopName}</strong> ({confirmedBooking.phoneDisplay}) com todos os dados preenchidos:
            </p>

            {/* Primary WhatsApp Deep Link CTA */}
            <motion.a
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              href={confirmedBooking.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[52px] px-6 py-3.5 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] text-[#F5F2ED] text-sm font-bold flex items-center justify-center gap-2.5 shadow-lg transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Abrir WhatsApp (21 9750-7533) com Mensagem Pronta</span>
            </motion.a>

            {/* Fallback Section */}
            <div className="p-4 rounded-xl bg-[#070605] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#A9A29B]">
                  Caso o WhatsApp não abra automaticamente:
                </span>
                <span className="text-xs font-mono-num text-[#F5F2ED] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#A84F1F]" />
                  {confirmedBooking.phoneDisplay}
                </span>
              </div>

              <pre className="text-xs text-[#F5F2ED]/90 whitespace-pre-wrap font-mono-num bg-[#14110F] p-3.5 rounded-lg border border-white/10">
                {confirmedBooking.formattedMessage}
              </pre>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  onClick={handleCopyMessage}
                  className="min-h-[40px] px-4 py-2 rounded-lg border border-white/15 hover:border-[#A84F1F] text-xs font-semibold text-[#F5F2ED] flex items-center gap-2 transition-colors"
                >
                  <Copy className="w-4 h-4 text-[#A84F1F]" />
                  <span>Copiar mensagem formatada</span>
                </button>

                <button
                  onClick={() => {
                    setConfirmedBooking(null);
                    setStep(1);
                  }}
                  className="min-h-[40px] px-4 py-2 text-xs text-[#A9A29B] hover:text-[#F5F2ED]"
                >
                  Fazer outro agendamento
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* STEP 1: Select Service & Desired Cut */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="font-display text-xl font-bold text-[#F5F2ED]">
                    01. Selecione o Serviço
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {services.map((srv) => {
                      const isSelected = activeService?.id === srv.id;
                      return (
                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          key={srv.id}
                          onClick={() => setSelectedServiceForBooking(srv)}
                          className={`p-5 rounded-2xl border text-left transition-all flex items-start justify-between gap-4 ${
                            isSelected
                              ? 'bg-[#582610]/40 border-[#A84F1F]'
                              : 'bg-[#14110F] border-white/10 hover:border-white/25'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-lg font-bold text-[#F5F2ED]">
                                {srv.name}
                              </span>
                            </div>
                            <p className="text-xs text-[#A9A29B] leading-relaxed">
                              {srv.description}
                            </p>
                            <div className="text-xs text-[#A9A29B] pt-1 font-mono-num">
                              <span>Duração: {srv.duration}</span>
                              <span className="mx-2">·</span>
                              <span>{srv.category}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono-num text-lg font-bold text-[#A84F1F]">
                              R$ {srv.price}
                            </span>
                            <div
                              className={`mt-2 w-6 h-6 rounded-full border flex items-center justify-center ml-auto ${
                                isSelected
                                  ? 'bg-[#A84F1F] border-[#A84F1F] text-[#F5F2ED]'
                                  : 'border-white/20'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Select Desired Haircut Reference */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-[#F5F2ED]">
                      Corte de Referência Desejado
                    </h3>
                    <span className="text-xs text-[#A84F1F] font-semibold">
                      {activeCut.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {haircuts.map((cut) => {
                      const isSelected = activeCut?.id === cut.id;
                      return (
                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          key={cut.id}
                          onClick={() => setSelectedCutForBooking(cut)}
                          className={`flex items-center gap-3 p-2 pr-4 rounded-xl border shrink-0 text-left transition-all ${
                            isSelected
                              ? 'bg-[#582610]/50 border-[#A84F1F]'
                              : 'bg-[#14110F] border-white/10 hover:border-white/25'
                          }`}
                        >
                          <div className="w-12 h-14 rounded-lg overflow-hidden shrink-0">
                            <ResilientImage
                              src={cut.imageUrl}
                              alt={cut.name}
                              className="w-full h-full"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#F5F2ED] whitespace-nowrap">
                              {cut.name}
                            </p>
                            <p className="text-[11px] text-[#A9A29B] whitespace-nowrap">
                              {cut.category} · {cut.serviceDuration}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Select Barber (No star rating as requested) */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold text-[#F5F2ED]">
                  02. Escolha seu Barbeiro
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {barbers.map((barber) => {
                    const isSelected = activeBarber?.id === barber.id;
                    return (
                      <motion.button
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        key={barber.id}
                        onClick={() => setSelectedBarberForBooking(barber)}
                        className={`p-5 rounded-2xl border text-left transition-all flex gap-4 items-start ${
                          isSelected
                            ? 'bg-[#582610]/40 border-[#A84F1F]'
                            : 'bg-[#14110F] border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/15">
                          <ResilientImage
                            src={barber.photoUrl}
                            alt={barber.name}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-display text-lg font-bold text-[#F5F2ED] truncate">
                              {barber.name}
                            </h3>
                          </div>
                          <p className="text-xs text-[#A84F1F] font-semibold">
                            {barber.roleTitle}
                          </p>
                          <p className="text-xs text-[#A9A29B] line-clamp-2">
                            {barber.bio}
                          </p>
                          <div className="text-xs text-[#F5F2ED]/80 pt-1">
                            <span>
                              Especialidades: {barber.specialties.join(' · ')}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#A84F1F] font-mono-num pt-0.5">
                            Próximo horário livre: {barber.nextAvailable}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Select Date & Time */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h2 className="font-display text-xl font-bold text-[#F5F2ED]">
                    03. Selecione a Data
                  </h2>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                    {availableDays.map((d) => {
                      const isSelected = d.iso === selectedDate;
                      return (
                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          key={d.iso}
                          onClick={() => setSelectedDate(d.iso)}
                          className={`min-w-[82px] p-3.5 rounded-2xl border text-center transition-all shrink-0 ${
                            isSelected
                              ? 'bg-[#A84F1F] border-[#A84F1F] text-[#F5F2ED]'
                              : 'bg-[#14110F] border-white/10 text-[#A9A29B] hover:border-white/25'
                          }`}
                        >
                          <span className="block text-[11px] font-medium uppercase">
                            {d.dayName}
                          </span>
                          <span className="block font-mono-num text-xl font-bold text-[#F5F2ED] my-0.5">
                            {d.dayNumber}
                          </span>
                          <span className="block text-[11px] opacity-80">
                            {d.monthShort}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-[#F5F2ED]">
                      Horários disponíveis com {activeBarber.name}
                    </h3>
                    <span className="text-xs text-[#A9A29B]">
                      Toque para selecionar
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                    {allSlotsForBarber.map((slot) => {
                      const isUnavailable = unavailableTimes.has(slot);
                      const isSelected = selectedTime === slot && !isUnavailable;
                      return (
                        <motion.button
                          whileHover={!isUnavailable ? { y: -2 } : undefined}
                          whileTap={!isUnavailable ? { scale: 0.96 } : undefined}
                          key={slot}
                          disabled={isUnavailable}
                          onClick={() => setSelectedTime(slot)}
                          className={`min-h-[48px] py-2.5 px-3 rounded-xl border font-mono-num text-sm font-semibold transition-all ${
                            isUnavailable
                              ? 'bg-[#070605] border-white/5 text-[#A9A29B]/30 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#A84F1F] border-[#A84F1F] text-[#F5F2ED] scale-[1.02] shadow-md'
                              : 'bg-[#14110F] border-white/10 text-[#F5F2ED] hover:border-[#A84F1F]'
                          }`}
                        >
                          {slot}
                          {isUnavailable && (
                            <span className="block text-[10px] font-sans font-normal">
                              Indisponível
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Customer Name & Phone */}
            {step === 4 && (
              <div className="rounded-2xl bg-[#14110F] border border-white/10 p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#F5F2ED]">
                    04. Seus Dados de Contato
                  </h2>
                  <p className="text-xs text-[#A9A29B] mt-1">
                    Usaremos estes dados apenas para identificar seu agendamento na recepção e no WhatsApp.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="booking-name"
                      className="block text-xs font-medium text-[#A9A29B]"
                    >
                      Seu Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#A84F1F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="booking-name"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ex: Gabriel Almeida"
                        maxLength={100}
                        className="w-full min-h-[48px] pl-10 pr-4 py-2.5 rounded-xl bg-[#070605] border border-white/15 text-sm text-[#F5F2ED] focus:outline-none focus:border-[#A84F1F]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="booking-phone"
                      className="block text-xs font-medium text-[#A9A29B]"
                    >
                      Seu Telefone / WhatsApp (com DDD) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#A84F1F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="booking-phone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Ex: (21) 9750-7533"
                        maxLength={30}
                        className="w-full min-h-[48px] pl-10 pr-4 py-2.5 rounded-xl bg-[#070605] border border-white/15 text-sm font-mono-num text-[#F5F2ED] focus:outline-none focus:border-[#A84F1F]"
                      />
                    </div>
                  </div>
                </div>

                {!user && (
                  <p className="text-xs text-[#A9A29B]">
                    Dica: Você pode agendar sem criar conta ou entrar com Google na aba Perfil para salvar seu histórico.
                  </p>
                )}
              </div>
            )}

            {/* STEP 5: Booking Confirmation Summary */}
            {step === 5 && (
              <div className="rounded-2xl bg-[#14110F] border border-white/15 p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#A84F1F]">
                      ETAPA FINAL · REVISÃO
                    </span>
                    <h2 className="font-display text-2xl font-bold text-[#F5F2ED]">
                      Resumo do Agendamento
                    </h2>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl border border-white/15 hover:border-[#A84F1F] text-xs font-medium text-[#F5F2ED] flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#A84F1F]" />
                    <span>Editar agendamento</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 rounded-xl bg-[#070605] border border-white/10">
                    <span className="block text-xs text-[#A9A29B]">Barbearia</span>
                    <span className="font-display font-bold text-[#F5F2ED]">
                      {businessSettings.shopName}
                    </span>
                    <span className="block text-xs text-[#A9A29B] mt-0.5">
                      WhatsApp: {businessSettings.phone || DEFAULT_PHONE_DISPLAY}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#070605] border border-white/10">
                    <span className="block text-xs text-[#A9A29B]">Cliente</span>
                    <span className="font-semibold text-[#F5F2ED]">
                      {customerName}
                    </span>
                    <span className="block text-xs font-mono-num text-[#A9A29B] mt-0.5">
                      {customerPhone}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#070605] border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="block text-xs text-[#A9A29B]">Serviço</span>
                      <span className="font-semibold text-[#F5F2ED]">
                        {activeService.name}
                      </span>
                      <span className="block text-xs text-[#A9A29B]">
                        {activeService.duration}
                      </span>
                    </div>
                    <span className="font-mono-num text-lg font-bold text-[#A84F1F]">
                      R$ {activeService.price}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#070605] border border-white/10 flex items-center gap-3">
                    <Scissors className="w-4 h-4 text-[#A84F1F] shrink-0" />
                    <div>
                      <span className="block text-xs text-[#A9A29B]">
                        Corte de Referência
                      </span>
                      <span className="font-semibold text-[#F5F2ED]">
                        {activeCut.name} ({activeCut.category})
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#070605] border border-white/10 flex items-center gap-3">
                    <User className="w-4 h-4 text-[#A84F1F] shrink-0" />
                    <div>
                      <span className="block text-xs text-[#A9A29B]">Barbeiro</span>
                      <span className="font-semibold text-[#F5F2ED]">
                        {activeBarber.name}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#070605] border border-white/10 flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#A84F1F] shrink-0" />
                    <div>
                      <span className="block text-xs text-[#A9A29B]">
                        Data & Horário
                      </span>
                      <span className="font-semibold font-mono-num text-[#F5F2ED]">
                        {selectedDayObj?.labelFull} às {selectedTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmBooking}
                    className="w-full min-h-[52px] px-6 py-3.5 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] text-[#F5F2ED] text-sm font-bold flex items-center justify-center gap-2.5 shadow-xl transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Confirmar e enviar para WhatsApp (21 9750-7533)</span>
                  </motion.button>
                </div>
              </div>
            )}

            {formError && (
              <div className="p-3.5 rounded-xl bg-[#582610]/50 border border-[#A84F1F] text-xs text-[#F5F2ED]">
                {formError}
              </div>
            )}

            {/* Bottom Step Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {step > 1 ? (
                <button
                  onClick={() => setStep((prev) => prev - 1)}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl border border-white/15 hover:border-white/30 text-xs font-semibold text-[#F5F2ED] flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
              ) : (
                <div />
              )}

              {step < 5 && (
                <motion.button
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNextStep}
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] text-xs md:text-sm font-semibold text-[#F5F2ED] flex items-center gap-2"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
