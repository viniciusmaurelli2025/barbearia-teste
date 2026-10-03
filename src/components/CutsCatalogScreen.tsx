import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Heart,
  Search,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HAIRCUT_CATEGORIES } from '../data/initialCatalog';
import { Haircut } from '../types';
import { ResilientImage } from './ResilientImage';

export const CutsCatalogScreen: React.FC = () => {
  const {
    haircuts,
    favoriteCutIds,
    toggleFavoriteCut,
    setActiveCutDetail,
    openTryOnWithCut,
    openBookingWithCut,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedLength, setSelectedLength] = useState<string>('Todos');
  const [selectedMaintenance, setSelectedMaintenance] = useState<string>('Todos');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filteredCuts = useMemo(() => {
    return haircuts.filter((cut) => {
      const matchesSearch =
        cut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cut.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cut.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Todos' || cut.category === selectedCategory;

      const matchesLength =
        selectedLength === 'Todos' || cut.length === selectedLength;

      const matchesMaintenance =
        selectedMaintenance === 'Todos' ||
        cut.maintenanceLevel === selectedMaintenance;

      const matchesFav = !onlyFavorites || favoriteCutIds.includes(cut.id);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLength &&
        matchesMaintenance &&
        matchesFav
      );
    });
  }, [
    haircuts,
    searchQuery,
    selectedCategory,
    selectedLength,
    selectedMaintenance,
    onlyFavorites,
    favoriteCutIds,
  ]);

  const handleQuickShare = async (e: React.MouseEvent, cut: Haircut) => {
    e.stopPropagation();
    const text = `${cut.name} (${cut.category}) — ${cut.description}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `BARBERIA · ${cut.name}`,
          text,
          url: window.location.href,
        });
        return;
      } catch {
        // fallback
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Referência "${cut.name}" copiada!`);
    } catch {
      showToast('Referência selecionada.', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs font-medium tracking-widest text-[#A84F1F] mb-1">
            CATÁLOGO EDITORIAL
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[#F5F2ED]">
            Biblioteca de Cortes Masculinos
          </h1>
          <p className="text-sm text-[#A9A29B] mt-1 max-w-2xl">
            Explore referências clássicas e contemporâneas, salve seus favoritos, simule no seu rosto com IA ou agende diretamente.
          </p>
        </div>
        <div className="text-xs text-[#A9A29B] font-mono-num">
          {filteredCuts.length} {filteredCuts.length === 1 ? 'corte encontrado' : 'cortes disponíveis'}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#A9A29B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome (ex: Low Fade, French Crop, Pompadour)..."
              className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-xl bg-[#14110F] border border-white/10 text-sm text-[#F5F2ED] placeholder:text-[#A9A29B]/60 focus:outline-none focus:border-[#A84F1F]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-[#A9A29B] hover:text-[#F5F2ED]"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Length Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedLength}
              onChange={(e) => setSelectedLength(e.target.value)}
              aria-label="Filtrar por comprimento"
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#14110F] border border-white/10 text-xs font-medium text-[#F5F2ED] focus:outline-none focus:border-[#A84F1F]"
            >
              <option value="Todos">Comprimento: Todos</option>
              <option value="Curto">Comprimento: Curto</option>
              <option value="Médio">Comprimento: Médio</option>
              <option value="Longo">Comprimento: Longo</option>
            </select>
          </div>

          {/* Maintenance/Style Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedMaintenance}
              onChange={(e) => setSelectedMaintenance(e.target.value)}
              aria-label="Filtrar por manutenção"
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#14110F] border border-white/10 text-xs font-medium text-[#F5F2ED] focus:outline-none focus:border-[#A84F1F]"
            >
              <option value="Todos">Manutenção: Todas</option>
              <option value="Baixa">Manutenção: Baixa</option>
              <option value="Média">Manutenção: Média</option>
              <option value="Alta">Manutenção: Alta</option>
            </select>
          </div>

          {/* Favorites Toggle */}
          <div className="md:col-span-2">
            <button
              onClick={() => setOnlyFavorites((prev) => !prev)}
              className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                onlyFavorites
                  ? 'bg-[#A84F1F] border-[#A84F1F] text-[#F5F2ED]'
                  : 'bg-[#14110F] border-white/10 text-[#A9A29B] hover:text-[#F5F2ED]'
              }`}
            >
              <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-current' : ''}`} />
              <span>Favoritos ({favoriteCutIds.length})</span>
            </button>
          </div>
        </div>

        {/* Interactive Category Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {HAIRCUT_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'bg-[#A84F1F] text-[#F5F2ED]'
                    : 'bg-[#14110F] text-[#A9A29B] hover:text-[#F5F2ED] border border-white/10'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredCuts.length === 0 ? (
        <div className="rounded-2xl bg-[#14110F] border border-white/10 p-12 text-center space-y-4">
          <p className="font-display text-lg font-bold text-[#F5F2ED]">
            Nenhum corte encontrado para os filtros selecionados
          </p>
          <p className="text-sm text-[#A9A29B] max-w-md mx-auto">
            Experimente limpar a busca ou selecionar outra categoria para visualizar todo o nosso catálogo.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Todos');
              setSelectedLength('Todos');
              setSelectedMaintenance('Todos');
              setOnlyFavorites(false);
            }}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#A84F1F] text-[#F5F2ED] text-xs font-semibold"
          >
            Mostrar todos os cortes
          </button>
        </div>
      ) : (
        /* Grid of Haircut Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCuts.map((cut) => {
            const isFav = favoriteCutIds.includes(cut.id);
            return (
              <article
                key={cut.id}
                onClick={() => setActiveCutDetail(cut)}
                className="group cursor-pointer rounded-2xl bg-[#14110F] border border-white/10 hover:border-[#A84F1F]/60 overflow-hidden flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <ResilientImage
                      src={cut.imageUrl}
                      alt={cut.name}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070605] via-transparent to-transparent opacity-80" />

                    {/* Top Right Quick Actions */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleQuickShare(e, cut)}
                        className="min-h-[40px] min-w-[40px] rounded-full bg-[#070605]/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#F5F2ED] hover:border-[#A84F1F] transition-colors"
                        aria-label={`Compartilhar ${cut.name}`}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteCut(cut.id);
                        }}
                        className="min-h-[40px] min-w-[40px] rounded-full bg-[#070605]/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#F5F2ED] hover:border-[#A84F1F] transition-colors"
                        aria-label={`Favoritar ${cut.name}`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFav ? 'fill-[#A84F1F] text-[#A84F1F]' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Bottom overlay title */}
                    <div className="absolute bottom-3 left-4 right-4">
                      {/* Clean unboxed metadata */}
                      <div className="text-xs text-[#A9A29B] mb-0.5">
                        <span>{cut.category}</span>
                        <span className="mx-1.5">·</span>
                        <span>{cut.length}</span>
                        <span className="mx-1.5">·</span>
                        <span className="font-mono-num">{cut.serviceDuration}</span>
                      </div>
                      <h2 className="font-display text-xl font-bold text-[#F5F2ED]">
                        {cut.name}
                      </h2>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4">
                    <p className="text-xs text-[#A9A29B] line-clamp-2 leading-relaxed">
                      {cut.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer Buttons */}
                <div className="px-4 pb-4 pt-2 grid grid-cols-2 gap-2 border-t border-white/5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openTryOnWithCut(cut);
                    }}
                    className="min-h-[42px] px-3 py-2 rounded-xl bg-[#070605] hover:bg-[#582610] border border-white/10 text-[#F5F2ED] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#A84F1F]" />
                    <span>Simular IA</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBookingWithCut(cut);
                    }}
                    className="min-h-[42px] px-3 py-2 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] text-[#F5F2ED] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
