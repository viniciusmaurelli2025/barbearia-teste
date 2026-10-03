import React from 'react';
import {
  Bookmark,
  Calendar,
  Heart,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResilientImage } from './ResilientImage';

export const CutDetailModal: React.FC = () => {
  const {
    activeCutDetail,
    setActiveCutDetail,
    barbers,
    haircuts,
    favoriteCutIds,
    toggleFavoriteCut,
    saveCutReference,
    openTryOnWithCut,
    openBookingWithCut,
    showToast,
    setSelectedBarberForBooking,
  } = useApp();

  if (!activeCutDetail) return null;

  const isFavorite = favoriteCutIds.includes(activeCutDetail.id);
  const matchingBarbers = barbers.filter((b) =>
    activeCutDetail.barberIds.includes(b.id)
  );
  const relatedPhotos = haircuts
    .filter(
      (h) =>
        h.category === activeCutDetail.category && h.id !== activeCutDetail.id
    )
    .slice(0, 3);

  const handleShare = async () => {
    const shareText = `${activeCutDetail.name} (${activeCutDetail.category}) — ${activeCutDetail.description}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `BARBERIA · ${activeCutDetail.name}`,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // user cancelled or fallback
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText} - ${window.location.href}`);
      showToast('Link e referência do corte copiados!');
    } catch {
      showToast('Referência pronta para compartilhar.', 'info');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cut-detail-title"
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-2xl bg-[#14110F] border border-white/10 text-[#F5F2ED] shadow-2xl">
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 bg-[#14110F]/95 backdrop-blur-md border-b border-white/10">
          <div className="text-xs text-[#A9A29B]">
            <span>{activeCutDetail.category}</span>
            <span className="mx-2">·</span>
            <span>Comprimento {activeCutDetail.length}</span>
            <span className="mx-2">·</span>
            <span className="font-mono-num">{activeCutDetail.serviceDuration}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavoriteCut(activeCutDetail.id)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-white/10 hover:border-white/25 transition-colors"
              aria-label="Favoritar corte"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-[#A84F1F] text-[#A84F1F]' : 'text-[#A9A29B]'
                }`}
              />
            </button>
            <button
              onClick={() => setActiveCutDetail(null)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-white/10 text-[#A9A29B] hover:text-[#F5F2ED] transition-colors"
              aria-label="Fechar detalhes"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 md:p-8 space-y-8">
          {/* Main Image & Primary Description */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5">
              <div className="aspect-[3/4] rounded-xl overflow-hidden border border-white/10">
                <ResilientImage
                  src={activeCutDetail.imageUrl}
                  alt={activeCutDetail.name}
                  className="w-full h-full"
                />
              </div>
            </div>

            <div className="md:col-span-7 space-y-5">
              <div>
                <p className="text-xs text-[#A84F1F] font-medium tracking-wide mb-1">
                  {activeCutDetail.style}
                </p>
                <h2
                  id="cut-detail-title"
                  className="font-display text-2xl md:text-3xl font-bold text-[#F5F2ED]"
                >
                  {activeCutDetail.name}
                </h2>
              </div>

              <p className="text-sm md:text-base text-[#A9A29B] leading-relaxed">
                {activeCutDetail.description}
              </p>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10 text-sm">
                <div>
                  <span className="block text-xs text-[#A9A29B]">
                    Nível de manutenção
                  </span>
                  <span className="font-semibold text-[#F5F2ED]">
                    {activeCutDetail.maintenanceLevel}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-[#A9A29B]">
                    Tempo aproximado
                  </span>
                  <span className="font-semibold font-mono-num text-[#F5F2ED]">
                    {activeCutDetail.serviceDuration}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs text-[#A9A29B]">
                    Tipo de cabelo recomendado
                  </span>
                  <span className="font-semibold text-[#F5F2ED]">
                    {activeCutDetail.recommendedHairType}
                  </span>
                </div>
              </div>

              {/* 4 Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => openBookingWithCut(activeCutDetail)}
                  className="min-h-[48px] px-4 py-3 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] active:scale-[0.98] text-[#F5F2ED] text-sm font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar este corte</span>
                </button>
                <button
                  onClick={() => openTryOnWithCut(activeCutDetail)}
                  className="min-h-[48px] px-4 py-3 rounded-xl bg-[#582610] hover:bg-[#6B451F] active:scale-[0.98] text-[#F5F2ED] text-sm font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Experimentar com IA</span>
                </button>
                <button
                  onClick={() => saveCutReference(activeCutDetail)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/25 text-[#F5F2ED] text-xs font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                >
                  <Bookmark className="w-4 h-4 text-[#A84F1F]" />
                  <span>Salvar referência</span>
                </button>
                <button
                  onClick={handleShare}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/25 text-[#F5F2ED] text-xs font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                >
                  <Share2 className="w-4 h-4 text-[#A84F1F]" />
                  <span>Compartilhar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Barbeiros que realizam */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="font-display text-base font-bold text-[#F5F2ED] mb-3">
              Barbeiros especialistas neste corte
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(matchingBarbers.length > 0 ? matchingBarbers : barbers.slice(0, 2)).map(
                (barber) => (
                  <div
                    key={barber.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#070605] border border-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-white/15">
                        <ResilientImage
                          src={barber.photoUrl}
                          alt={barber.name}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#F5F2ED] truncate">
                          {barber.name}
                        </p>
                        <p className="text-xs text-[#A9A29B] truncate">
                          ★ <span className="font-mono-num">{barber.rating.toFixed(1)}</span> ·{' '}
                          {barber.nextAvailable}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBarberForBooking(barber);
                        openBookingWithCut(activeCutDetail);
                      }}
                      className="px-3 py-2 min-h-[40px] rounded-lg border border-white/15 hover:border-[#A84F1F] text-xs font-medium text-[#F5F2ED] whitespace-nowrap transition-colors"
                    >
                      Escolher
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Fotos de referência adicionais */}
          {relatedPhotos.length > 0 && (
            <div className="pt-6 border-t border-white/10">
              <h3 className="font-display text-base font-bold text-[#F5F2ED] mb-3">
                Outras referências em {activeCutDetail.category}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {relatedPhotos.map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => setActiveCutDetail(rel)}
                    className="group text-left rounded-xl overflow-hidden border border-white/10 hover:border-[#A84F1F] transition-colors"
                  >
                    <div className="aspect-[3/4]">
                      <ResilientImage
                        src={rel.imageUrl}
                        alt={rel.name}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2 bg-[#070605]">
                      <p className="text-xs font-medium text-[#F5F2ED] truncate">
                        {rel.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
