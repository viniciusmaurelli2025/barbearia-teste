import React, { useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  Pin,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import {
  Clock,
  Compass,
  ExternalLink,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const BarbershopMarker: React.FC<{
  position: { lat: number; lng: number };
  shopName: string;
  address: string;
}> = ({ position, shopName, address }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        onClick={() => setInfoOpen((prev) => !prev)}
        title={shopName}
      >
        <Pin
          background={'#A84F1F'}
          borderColor={'#070605'}
          glyphColor={'#F5F2ED'}
          scale={1.25}
        />
      </AdvancedMarker>
      {infoOpen && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={240}
          onCloseClick={() => setInfoOpen(false)}
        >
          <div className="text-[#070605] p-1">
            <p className="font-bold text-sm">{shopName}</p>
            <p className="text-xs text-neutral-700 mt-0.5">{address}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const MapSection: React.FC = () => {
  const { businessSettings, showToast } = useApp();
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const position = {
    lat: Number(businessSettings.latitude) || -23.561414,
    lng: Number(businessSettings.longitude) || -46.655881,
  };

  const encodedAddress = encodeURIComponent(businessSettings.address);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  const openMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  const cleanWhatsapp = businessSettings.whatsapp.replace(/\D/g, '');

  const handleCalculateDistance = () => {
    if (!navigator.geolocation) {
      showToast('Geolocalização não suportada neste navegador.', 'info');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = calculateHaversineKm(
          pos.coords.latitude,
          pos.coords.longitude,
          position.lat,
          position.lng
        );
        setDistanceKm(dist);
        setLocating(false);
      },
      () => {
        setLocating(false);
        showToast(
          'Permita o acesso à localização para calcular a distância exata.',
          'info'
        );
      },
      { timeout: 8000 }
    );
  };

  return (
    <section
      id="localizacao"
      className="rounded-2xl bg-[#14110F] border border-white/10 overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left column: Address, Hours, Contact & Actions */}
        <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-medium tracking-widest text-[#A84F1F]">
              LOCALIZAÇÃO & CONTATO
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#F5F2ED]">
              Estamos esperando por você
            </h2>
            <p className="text-sm text-[#A9A29B] leading-relaxed">
              Ambiente climatizado, café espresso especial, bar próprio e estacionamento conveniado no local.
            </p>

            <div className="space-y-3.5 pt-2 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#A84F1F] shrink-0 mt-1" />
                <div>
                  <span className="block text-xs text-[#A9A29B]">Endereço</span>
                  <span className="text-[#F5F2ED] font-medium">
                    {businessSettings.address}
                  </span>
                  {distanceKm !== null && (
                    <span className="block text-xs text-[#A84F1F] font-mono-num mt-0.5">
                      Aprox. {distanceKm.toFixed(1)} km da sua localização atual
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#A84F1F] shrink-0 mt-1" />
                <div>
                  <span className="block text-xs text-[#A9A29B]">
                    Horário de funcionamento
                  </span>
                  <span className="text-[#F5F2ED] font-medium font-mono-num">
                    {businessSettings.openingHours}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#A84F1F] shrink-0 mt-1" />
                <div>
                  <span className="block text-xs text-[#A9A29B]">
                    Telefone & Instagram
                  </span>
                  <span className="text-[#F5F2ED] font-medium font-mono-num">
                    {businessSettings.phone}
                  </span>
                  <span className="mx-2 text-[#A9A29B]">·</span>
                  <span className="text-[#A9A29B]">{businessSettings.instagram}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#A84F1F] hover:bg-[#8E4118] text-[#F5F2ED] text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Navigation className="w-4 h-4" />
                <span>Como chegar</span>
              </a>
              <a
                href={`https://wa.me/${cleanWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#582610] hover:bg-[#6B451F] text-[#F5F2ED] text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chamar no WhatsApp</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleCalculateDistance}
                disabled={locating}
                className="min-h-[44px] px-3 py-2 rounded-xl border border-white/10 hover:border-white/25 text-[#A9A29B] hover:text-[#F5F2ED] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Compass className="w-4 h-4 text-[#A84F1F]" />
                <span>
                  {locating
                    ? 'Calculando...'
                    : distanceKm !== null
                    ? `${distanceKm.toFixed(1)} km de distância`
                    : 'Calcular distância'}
                </span>
              </button>
              <a
                href={openMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-3 py-2 rounded-xl border border-white/10 hover:border-white/25 text-[#A9A29B] hover:text-[#F5F2ED] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-4 h-4 text-[#A84F1F]" />
                <span>Abrir no Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Google Map */}
        <div className="lg:col-span-7 h-[340px] lg:h-auto min-h-[340px] w-full bg-[#070605] relative border-t lg:border-t-0 lg:border-l border-white/10">
          {apiKey ? (
            <APIProvider apiKey={apiKey} language="pt-BR" region="BR">
              <div style={{ height: '100%', width: '100%', minHeight: '340px' }}>
                <Map
                  mapId="DEMO_MAP_ID"
                  defaultCenter={position}
                  defaultZoom={16}
                  gestureHandling="cooperative"
                  disableDefaultUI={false}
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                >
                  <BarbershopMarker
                    position={position}
                    shopName={businessSettings.shopName}
                    address={businessSettings.address}
                  />
                </Map>
              </div>
            </APIProvider>
          ) : (
            <div className="w-full h-full min-h-[340px] flex flex-col items-center justify-center p-6 text-center">
              <MapPin className="w-8 h-8 text-[#A84F1F] mb-2" />
              <p className="text-sm font-semibold text-[#F5F2ED]">
                {businessSettings.shopName}
              </p>
              <p className="text-xs text-[#A9A29B] mt-1 max-w-sm">
                {businessSettings.address}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
