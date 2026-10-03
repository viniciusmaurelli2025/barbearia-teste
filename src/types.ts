export type ScreenTab = 'home' | 'cuts' | 'ai' | 'booking' | 'profile' | 'admin';

export type HairLength = 'Curto' | 'Médio' | 'Longo';
export type MaintenanceLevel = 'Baixa' | 'Média' | 'Alta';

export interface Haircut {
  id: string;
  name: string;
  category: string;
  length: HairLength;
  style: string;
  description: string;
  maintenanceLevel: MaintenanceLevel;
  recommendedHairType: string;
  serviceDuration: string;
  imageUrl: string;
  barberIds: string[];
  featured: boolean;
  isPublic: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  category: string;
  isPublic: boolean;
}

export interface Barber {
  id: string;
  name: string;
  roleTitle: string;
  bio: string;
  photoUrl: string;
  specialties: string[];
  rating: number;
  completedCuts: number;
  availableHours: string[];
  whatsapp: string;
  nextAvailable: string;
  isPublic: boolean;
}

export interface Appointment {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  barberId: string;
  barberName: string;
  haircutId: string;
  haircutName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BusinessSettings {
  id: string;
  shopName: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp: string;
  instagram: string;
  email: string;
  openingHours: string;
  whatsappTemplate: string;
  blockedSlots: string[];
  isPublic: boolean;
}

export interface SavedReference {
  id: string;
  userId: string;
  haircutId: string;
  haircutName: string;
  category: string;
  imageUrl: string;
  notes: string;
  createdAt?: unknown;
}

export interface AiGeneration {
  id: string;
  userId: string;
  haircutId: string;
  haircutName: string;
  faceShape: string;
  compatibilityScore: number;
  summary: string;
  previewDataUrl: string;
  createdAt?: unknown;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  favoriteCutIds: string[];
  preferredBarberId?: string;
  themePreference: 'dark' | 'light';
}

export interface UserPrivateInfo {
  uid: string;
  phone: string;
  email: string;
}

export interface VisagismAnalysis {
  faceShape: string;
  compatibilityScore: number;
  whyItWorks: string;
  barberInstructions: string;
  maintenanceAdvice: string;
  hairToneHex: string;
  crownCenterY: number;
  headWidthRatio: number;
}
