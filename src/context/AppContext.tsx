import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  auth,
  clampString,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  sanitizeId,
} from '../lib/firebase';
import {
  INITIAL_BARBERS,
  INITIAL_BUSINESS_SETTINGS,
  INITIAL_HAIRCUTS,
  INITIAL_SERVICES,
} from '../data/initialCatalog';
import {
  AiGeneration,
  Appointment,
  Barber,
  BusinessSettings,
  Haircut,
  SavedReference,
  ScreenTab,
  ServiceItem,
  UserPrivateInfo,
  UserProfile,
} from '../types';

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextValue {
  // Navigation & Theme
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Auth & User
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  userProfile: UserProfile | null;
  userPrivateInfo: UserPrivateInfo | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfileInfo: (name: string, phone: string) => Promise<void>;

  // Catalog & Settings
  haircuts: Haircut[];
  services: ServiceItem[];
  barbers: Barber[];
  businessSettings: BusinessSettings;
  isCatalogLoading: boolean;

  // User Collections
  favoriteCutIds: string[];
  toggleFavoriteCut: (cutId: string) => Promise<void>;
  savedReferences: SavedReference[];
  saveCutReference: (cut: Haircut, notes?: string) => Promise<void>;
  removeSavedReference: (refId: string) => Promise<void>;
  aiGenerations: AiGeneration[];
  saveAiGenerationRecord: (record: Omit<AiGeneration, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  removeAiGenerationRecord: (genId: string) => Promise<void>;
  appointments: Appointment[];
  createBookingAppointment: (
    data: Omit<Appointment, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>
  ) => Promise<Appointment>;
  cancelAppointment: (appointmentId: string) => Promise<void>;

  // Cross-screen selection state
  activeCutDetail: Haircut | null;
  setActiveCutDetail: (cut: Haircut | null) => void;
  selectedCutForAi: Haircut;
  setSelectedCutForAi: (cut: Haircut) => void;
  selectedCutForBooking: Haircut | null;
  setSelectedCutForBooking: (cut: Haircut | null) => void;
  selectedServiceForBooking: ServiceItem | null;
  setSelectedServiceForBooking: (service: ServiceItem | null) => void;
  selectedBarberForBooking: Barber | null;
  setSelectedBarberForBooking: (barber: Barber | null) => void;

  // Quick navigation helpers
  openTryOnWithCut: (cut: Haircut) => void;
  openBookingWithCut: (cut: Haircut) => void;
  openBookingWithService: (service: ServiceItem) => void;
  openBookingWithBarber: (barber: Barber) => void;

  // Admin CRUD actions
  saveBusinessSettingsAdmin: (settings: BusinessSettings) => Promise<void>;
  saveServiceAdmin: (service: ServiceItem) => Promise<void>;
  deleteServiceAdmin: (serviceId: string) => Promise<void>;
  saveBarberAdmin: (barber: Barber) => Promise<void>;
  deleteBarberAdmin: (barberId: string) => Promise<void>;
  saveHaircutAdmin: (cut: Haircut) => Promise<void>;
  deleteHaircutAdmin: (cutId: string) => Promise<void>;
  updateAppointmentStatusAdmin: (
    appointmentId: string,
    status: 'confirmed' | 'completed' | 'cancelled'
  ) => Promise<void>;
  seedInitialCatalogToFirestore: () => Promise<void>;

  // Toast feedback
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const ADMIN_EMAIL = 'viniciusmaurelli2025@gmail.com';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ScreenTab>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPrivateInfo, setUserPrivateInfo] = useState<UserPrivateInfo | null>(null);

  const [haircuts, setHaircuts] = useState<Haircut[]>(INITIAL_HAIRCUTS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [barbers, setBarbers] = useState<Barber[]>(INITIAL_BARBERS);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(
    INITIAL_BUSINESS_SETTINGS
  );
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  const [guestFavorites, setGuestFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('barberia_guest_favs');
      return saved ? JSON.parse(saved) : ['cut_low_fade', 'cut_french_crop'];
    } catch {
      return ['cut_low_fade'];
    }
  });

  const [savedReferences, setSavedReferences] = useState<SavedReference[]>([]);
  const [aiGenerations, setAiGenerations] = useState<AiGeneration[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [activeCutDetail, setActiveCutDetail] = useState<Haircut | null>(null);
  const [selectedCutForAi, setSelectedCutForAi] = useState<Haircut>(INITIAL_HAIRCUTS[0]);
  const [selectedCutForBooking, setSelectedCutForBooking] = useState<Haircut | null>(
    INITIAL_HAIRCUTS[0]
  );
  const [selectedServiceForBooking, setSelectedServiceForBooking] =
    useState<ServiceItem | null>(INITIAL_SERVICES[0]);
  const [selectedBarberForBooking, setSelectedBarberForBooking] = useState<Barber | null>(
    INITIAL_BARBERS[0]
  );

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (user && userProfile) {
      const userDocRef = doc(db, 'users', user.uid);
      updateDoc(userDocRef, {
        themePreference: next,
        updatedAt: serverTimestamp(),
      }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
    }
  };

  // 1. Auth Listener & User Document Bootstrap
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        const adminMatch =
          currUser.email === ADMIN_EMAIL && currUser.emailVerified === true;
        setIsAdmin(adminMatch);

        // Ensure UserProfile and UserPrivateInfo exist in Firestore
        const userPath = `users/${currUser.uid}`;
        const userRef = doc(db, 'users', currUser.uid);
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            const initialProfile: UserProfile = {
              uid: currUser.uid,
              displayName: clampString(
                currUser.displayName || currUser.email?.split('@')[0] || 'Cliente',
                100,
                1
              ),
              favoriteCutIds: guestFavorites.slice(0, 50),
              themePreference: theme,
            };
            await setDoc(userRef, {
              ...initialProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setUserProfile(initialProfile);
          } else {
            const data = snap.data() as UserProfile;
            setUserProfile(data);
            if (data.themePreference) {
              setTheme(data.themePreference);
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, userPath);
        }

        // Private contact info subcollection
        const privPath = `users/${currUser.uid}/private/contact`;
        const privRef = doc(db, 'users', currUser.uid, 'private', 'contact');
        try {
          const privSnap = await getDoc(privRef);
          if (!privSnap.exists()) {
            const initPriv: UserPrivateInfo = {
              uid: currUser.uid,
              phone: clampString(currUser.phoneNumber || '', 30),
              email: clampString(currUser.email || '', 150),
            };
            await setDoc(privRef, {
              ...initPriv,
              updatedAt: serverTimestamp(),
            });
            setUserPrivateInfo(initPriv);
          } else {
            setUserPrivateInfo(privSnap.data() as UserPrivateInfo);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, privPath);
        }
      } else {
        setIsAdmin(false);
        setUserProfile(null);
        setUserPrivateInfo(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // 2. Public Catalog Real-time Listeners (with isPublic == true query constraint)
  useEffect(() => {
    const qHaircuts = query(collection(db, 'haircuts'), where('isPublic', '==', true));
    const unsubHaircuts = onSnapshot(
      qHaircuts,
      (snapshot) => {
        if (!snapshot.empty) {
          const initialMap = new Map(INITIAL_HAIRCUTS.map((h) => [h.id, h]));
          const list = snapshot.docs.map((d) => {
            const raw = d.data() as Haircut;
            const fallback = initialMap.get(raw.id);
            return fallback ? { ...raw, imageUrl: fallback.imageUrl } : raw;
          });
          setHaircuts(list);
        }
        setIsCatalogLoading(false);
      },
      (error) => {
        setIsCatalogLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'haircuts');
      }
    );

    const qServices = query(collection(db, 'services'), where('isPublic', '==', true));
    const unsubServices = onSnapshot(
      qServices,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as ServiceItem);
          setServices(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'services');
      }
    );

    const qBarbers = query(collection(db, 'barbers'), where('isPublic', '==', true));
    const unsubBarbers = onSnapshot(
      qBarbers,
      (snapshot) => {
        if (!snapshot.empty) {
          const initialBarberMap = new Map(INITIAL_BARBERS.map((b) => [b.id, b]));
          const list = snapshot.docs.map((d) => {
            const raw = d.data() as Barber;
            const fallback = initialBarberMap.get(raw.id);
            return {
              ...raw,
              photoUrl: fallback ? fallback.photoUrl : raw.photoUrl,
              whatsapp: '552197507533',
            };
          });
          setBarbers(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'barbers');
      }
    );

    const qSettings = query(
      collection(db, 'business_settings'),
      where('isPublic', '==', true)
    );
    const unsubSettings = onSnapshot(
      qSettings,
      (snapshot) => {
        if (!snapshot.empty) {
          const mainDoc =
            snapshot.docs.find((d) => d.id === 'main') || snapshot.docs[0];
          if (mainDoc) {
            const raw = mainDoc.data() as BusinessSettings;
            setBusinessSettings({
              ...raw,
              phone: '(21) 9750-7533',
              whatsapp: '552197507533',
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'business_settings');
      }
    );

    return () => {
      unsubHaircuts();
      unsubServices();
      unsubBarbers();
      unsubSettings();
    };
  }, []);

  // 3. Authenticated User Collections Listeners
  useEffect(() => {
    if (!authReady || !user) {
      setSavedReferences([]);
      setAiGenerations([]);
      setAppointments([]);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          setUserProfile(snap.data() as UserProfile);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`)
    );

    const qRefs = query(
      collection(db, 'saved_references'),
      where('userId', '==', user.uid)
    );
    const unsubRefs = onSnapshot(
      qRefs,
      (snap) => {
        setSavedReferences(snap.docs.map((d) => d.data() as SavedReference));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'saved_references')
    );

    const qGens = query(
      collection(db, 'ai_generations'),
      where('userId', '==', user.uid)
    );
    const unsubGens = onSnapshot(
      qGens,
      (snap) => {
        setAiGenerations(snap.docs.map((d) => d.data() as AiGeneration));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'ai_generations')
    );

    const qAppts = isAdmin
      ? query(collection(db, 'appointments'))
      : query(collection(db, 'appointments'), where('userId', '==', user.uid));

    const unsubAppts = onSnapshot(
      qAppts,
      (snap) => {
        setAppointments(snap.docs.map((d) => d.data() as Appointment));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'appointments')
    );

    return () => {
      unsubProfile();
      unsubRefs();
      unsubGens();
      unsubAppts();
    };
  }, [authReady, user, isAdmin]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Sessão iniciada com sucesso.');
    } catch (error) {
      console.error('Login error:', error);
      showToast('Não foi possível concluir o login com Google.', 'error');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      if (activeTab === 'admin') {
        setActiveTab('home');
      }
      showToast('Você saiu da sua conta.', 'info');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserProfileInfo = async (name: string, phone: string) => {
    if (!user) {
      showToast('Faça login para salvar seu perfil.', 'info');
      return;
    }
    const cleanName = clampString(name, 100, 1);
    const cleanPhone = clampString(phone, 30);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: cleanName,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }

    try {
      await updateDoc(doc(db, 'users', user.uid, 'private', 'contact'), {
        phone: cleanPhone,
        email: clampString(user.email || '', 150),
        updatedAt: serverTimestamp(),
      });
      setUserPrivateInfo({
        uid: user.uid,
        phone: cleanPhone,
        email: user.email || '',
      });
      showToast('Dados atualizados com sucesso.');
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `users/${user.uid}/private/contact`
      );
    }
  };

  const favoriteCutIds = userProfile ? userProfile.favoriteCutIds : guestFavorites;

  const toggleFavoriteCut = async (cutId: string) => {
    const cleanCutId = sanitizeId(cutId);
    const exists = favoriteCutIds.includes(cleanCutId);
    const updated = exists
      ? favoriteCutIds.filter((id) => id !== cleanCutId)
      : [...favoriteCutIds, cleanCutId].slice(0, 50);

    if (!user) {
      setGuestFavorites(updated);
      try {
        localStorage.setItem('barberia_guest_favs', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      showToast(
        exists ? 'Removido dos favoritos.' : 'Corte adicionado aos favoritos.'
      );
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        favoriteCutIds: updated,
        updatedAt: serverTimestamp(),
      });
      showToast(
        exists ? 'Removido dos favoritos.' : 'Corte salvo nos seus favoritos.'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const saveCutReference = async (cut: Haircut, notes = 'Referência para o próximo corte') => {
    if (!user) {
      showToast('Faça login com Google para salvar referências na sua conta.', 'info');
      await signInWithGoogle();
      return;
    }
    const refId = sanitizeId(`ref_${cut.id}_${Date.now()}`);
    const payload = {
      id: refId,
      userId: user.uid,
      haircutId: sanitizeId(cut.id),
      haircutName: clampString(cut.name, 100, 1),
      category: clampString(cut.category, 60, 1),
      imageUrl: clampString(cut.imageUrl, 500, 1),
      notes: clampString(notes, 300),
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'saved_references', refId), payload);
      showToast(`Referência "${cut.name}" salva no seu perfil.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `saved_references/${refId}`);
    }
  };

  const removeSavedReference = async (refId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'saved_references', refId));
      showToast('Referência removida.', 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `saved_references/${refId}`);
    }
  };

  const saveAiGenerationRecord = async (
    record: Omit<AiGeneration, 'id' | 'userId' | 'createdAt'>
  ) => {
    if (!user) {
      showToast('Faça login para salvar simulações no histórico da conta.', 'info');
      return;
    }
    const genId = sanitizeId(`gen_${Date.now()}`);
    const payload = {
      id: genId,
      userId: user.uid,
      haircutId: sanitizeId(record.haircutId),
      haircutName: clampString(record.haircutName, 100, 1),
      faceShape: clampString(record.faceShape, 60, 1),
      compatibilityScore: Math.max(
        0,
        Math.min(100, Math.round(record.compatibilityScore))
      ),
      summary: clampString(record.summary, 600, 1),
      previewDataUrl: clampString(record.previewDataUrl, 340000, 1),
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'ai_generations', genId), payload);
      showToast('Simulação Barber AI salva no seu perfil.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `ai_generations/${genId}`);
    }
  };

  const removeAiGenerationRecord = async (genId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'ai_generations', genId));
      showToast('Simulação excluída.', 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `ai_generations/${genId}`);
    }
  };

  const createBookingAppointment = async (
    data: Omit<Appointment, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<Appointment> => {
    const aptId = sanitizeId(`apt_${Date.now()}`);
    const newApt: Appointment = {
      id: aptId,
      userId: user ? user.uid : 'guest',
      customerName: clampString(data.customerName, 100, 1),
      customerPhone: clampString(data.customerPhone, 30, 8),
      serviceId: sanitizeId(data.serviceId),
      serviceName: clampString(data.serviceName, 100, 1),
      servicePrice: Number(data.servicePrice) || 0,
      barberId: sanitizeId(data.barberId),
      barberName: clampString(data.barberName, 100, 1),
      haircutId: sanitizeId(data.haircutId || 'cut_low_fade'),
      haircutName: clampString(data.haircutName || 'Personalizado', 100, 1),
      date: clampString(data.date, 20, 1),
      time: clampString(data.time, 10, 1),
      status: 'confirmed',
    };

    if (user) {
      try {
        await setDoc(doc(db, 'appointments', aptId), {
          ...newApt,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `appointments/${aptId}`);
      }
    } else {
      setAppointments((prev) => [newApt, ...prev]);
    }

    showToast('Agendamento registrado! Abrindo WhatsApp...');
    return newApt;
  };

  const cancelAppointment = async (appointmentId: string) => {
    if (!user) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId ? { ...a, status: 'cancelled' } : a
        )
      );
      showToast('Agendamento cancelado.', 'info');
      return;
    }
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
      showToast('Agendamento cancelado.', 'info');
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `appointments/${appointmentId}`
      );
    }
  };

  // Cross-screen helpers
  const openTryOnWithCut = (cut: Haircut) => {
    setSelectedCutForAi(cut);
    setActiveCutDetail(null);
    setActiveTab('ai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBookingWithCut = (cut: Haircut) => {
    setSelectedCutForBooking(cut);
    setActiveCutDetail(null);
    setActiveTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBookingWithService = (service: ServiceItem) => {
    setSelectedServiceForBooking(service);
    setActiveTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBookingWithBarber = (barber: Barber) => {
    setSelectedBarberForBooking(barber);
    setActiveTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Operations
  const saveBusinessSettingsAdmin = async (settings: BusinessSettings) => {
    const docId = sanitizeId(settings.id || 'main');
    const payload = {
      id: docId,
      shopName: clampString(settings.shopName, 100, 1),
      heroEyebrow: clampString(settings.heroEyebrow, 80, 1),
      heroTitle: clampString(settings.heroTitle, 140, 1),
      heroDescription: clampString(settings.heroDescription, 300, 1),
      address: clampString(settings.address, 250, 1),
      latitude: Number(settings.latitude) || -23.561414,
      longitude: Number(settings.longitude) || -46.655881,
      phone: clampString(settings.phone, 30, 1),
      whatsapp: clampString(settings.whatsapp, 30, 1),
      instagram: clampString(settings.instagram, 100, 1),
      email: clampString(settings.email, 150, 1),
      openingHours: clampString(settings.openingHours, 200, 1),
      whatsappTemplate: clampString(settings.whatsappTemplate, 1000, 1),
      blockedSlots: (settings.blockedSlots || []).slice(0, 50).map((s) => clampString(s, 40)),
      isPublic: true,
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'business_settings', docId), payload);
      setBusinessSettings({ ...settings, id: docId, isPublic: true });
      showToast('Configurações da barbearia salvas.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `business_settings/${docId}`);
    }
  };

  const saveServiceAdmin = async (service: ServiceItem) => {
    const docId = sanitizeId(service.id);
    const payload = {
      id: docId,
      name: clampString(service.name, 100, 1),
      description: clampString(service.description, 400),
      duration: clampString(service.duration, 40, 1),
      price: Math.max(0, Math.min(10000, Number(service.price) || 0)),
      category: clampString(service.category || 'Geral', 60, 1),
      isPublic: true,
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'services', docId), payload);
      showToast(`Serviço "${service.name}" salvo.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `services/${docId}`);
    }
  };

  const deleteServiceAdmin = async (serviceId: string) => {
    try {
      await deleteDoc(doc(db, 'services', serviceId));
      showToast('Serviço removido.', 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `services/${serviceId}`);
    }
  };

  const saveBarberAdmin = async (barber: Barber) => {
    const docId = sanitizeId(barber.id);
    const payload = {
      id: docId,
      name: clampString(barber.name, 100, 1),
      roleTitle: clampString(barber.roleTitle, 100, 1),
      bio: clampString(barber.bio, 600),
      photoUrl: clampString(barber.photoUrl, 500, 1),
      specialties: (barber.specialties || []).slice(0, 10).map((s) => clampString(s, 60)),
      rating: Math.max(0, Math.min(5, Number(barber.rating) || 5)),
      completedCuts: Math.max(0, Math.round(Number(barber.completedCuts) || 100)),
      availableHours: (barber.availableHours || []).slice(0, 24).map((h) => clampString(h, 10)),
      whatsapp: clampString(barber.whatsapp, 30),
      nextAvailable: clampString(barber.nextAvailable || 'Hoje', 60),
      isPublic: true,
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'barbers', docId), payload);
      showToast(`Barbeiro "${barber.name}" atualizado.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `barbers/${docId}`);
    }
  };

  const deleteBarberAdmin = async (barberId: string) => {
    try {
      await deleteDoc(doc(db, 'barbers', barberId));
      showToast('Barbeiro removido.', 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `barbers/${barberId}`);
    }
  };

  const saveHaircutAdmin = async (cut: Haircut) => {
    const docId = sanitizeId(cut.id);
    const payload = {
      id: docId,
      name: clampString(cut.name, 100, 1),
      category: clampString(cut.category, 60, 1),
      length: cut.length || 'Curto',
      style: clampString(cut.style, 60, 1),
      description: clampString(cut.description, 600, 1),
      maintenanceLevel: cut.maintenanceLevel || 'Média',
      recommendedHairType: clampString(cut.recommendedHairType, 120, 1),
      serviceDuration: clampString(cut.serviceDuration, 40, 1),
      imageUrl: clampString(cut.imageUrl, 500, 1),
      barberIds: (cut.barberIds || []).slice(0, 10).map((id) => sanitizeId(id)),
      featured: Boolean(cut.featured),
      isPublic: true,
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'haircuts', docId), payload);
      showToast(`Corte "${cut.name}" salvo no catálogo.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `haircuts/${docId}`);
    }
  };

  const deleteHaircutAdmin = async (cutId: string) => {
    try {
      await deleteDoc(doc(db, 'haircuts', cutId));
      showToast('Corte removido do catálogo.', 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `haircuts/${cutId}`);
    }
  };

  const updateAppointmentStatusAdmin = async (
    appointmentId: string,
    status: 'confirmed' | 'completed' | 'cancelled'
  ) => {
    const existing = appointments.find((a) => a.id === appointmentId);
    if (!existing) return;
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status,
        updatedAt: serverTimestamp(),
      });
      showToast(`Status do agendamento atualizado para ${status}.`);
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `appointments/${appointmentId}`
      );
    }
  };

  const seedInitialCatalogToFirestore = async () => {
    if (!isAdmin) {
      showToast('Apenas o administrador pode sincronizar o catálogo.', 'error');
      return;
    }
    try {
      await saveBusinessSettingsAdmin(INITIAL_BUSINESS_SETTINGS);
      for (const srv of INITIAL_SERVICES) {
        await saveServiceAdmin(srv);
      }
      for (const brb of INITIAL_BARBERS) {
        await saveBarberAdmin(brb);
      }
      for (const cut of INITIAL_HAIRCUTS) {
        await saveHaircutAdmin(cut);
      }
      showToast('Catálogo completo sincronizado no Cloud Firestore!');
    } catch (err) {
      console.error('Seed error:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        user,
        authReady,
        isAdmin,
        userProfile,
        userPrivateInfo,
        signInWithGoogle,
        logout,
        updateUserProfileInfo,
        haircuts,
        services,
        barbers,
        businessSettings,
        isCatalogLoading,
        favoriteCutIds,
        toggleFavoriteCut,
        savedReferences,
        saveCutReference,
        removeSavedReference,
        aiGenerations,
        saveAiGenerationRecord,
        removeAiGenerationRecord,
        appointments,
        createBookingAppointment,
        cancelAppointment,
        activeCutDetail,
        setActiveCutDetail,
        selectedCutForAi,
        setSelectedCutForAi,
        selectedCutForBooking,
        setSelectedCutForBooking,
        selectedServiceForBooking,
        setSelectedServiceForBooking,
        selectedBarberForBooking,
        setSelectedBarberForBooking,
        openTryOnWithCut,
        openBookingWithCut,
        openBookingWithService,
        openBookingWithBarber,
        saveBusinessSettingsAdmin,
        saveServiceAdmin,
        deleteServiceAdmin,
        saveBarberAdmin,
        deleteBarberAdmin,
        saveHaircutAdmin,
        deleteHaircutAdmin,
        updateAppointmentStatusAdmin,
        seedInitialCatalogToFirestore,
        toasts,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
};
