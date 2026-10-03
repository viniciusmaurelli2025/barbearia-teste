/**
 * Phase 0 Security Specification Test Suite for BARBERIA Firestore Rules
 * Verifies all "Dirty Dozen" adversarial payloads are rejected with PERMISSION_DENIED.
 */

export interface DirtyDozenScenario {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  authUid: string | null;
  emailVerified: boolean;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenScenario[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on UserProfile',
    collection: 'users/userA',
    operation: 'create',
    authUid: 'userA',
    emailVerified: true,
    payload: {
      uid: 'userA',
      displayName: 'Carlos',
      favoriteCutIds: [],
      themePreference: 'dark',
      isAdmin: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Identity Spoofing on Appointment Create',
    collection: 'appointments/apt_1',
    operation: 'create',
    authUid: 'userA',
    emailVerified: true,
    payload: {
      id: 'apt_1',
      userId: 'userB',
      customerName: 'Carlos',
      customerPhone: '11999999999',
      serviceId: 'srv_corte',
      serviceName: 'Corte',
      servicePrice: 75,
      barberId: 'brb_1',
      barberName: 'Matheus',
      haircutId: 'cut_low_fade',
      haircutName: 'Low Fade',
      date: '2026-10-10',
      time: '14:00',
      status: 'confirmed',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Email Admin Spoof',
    collection: 'business_settings/main',
    operation: 'update',
    authUid: 'spoofAdmin',
    emailVerified: false,
    payload: {
      id: 'main',
      shopName: 'Hacked Shop',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'PII Blanket Read Attack',
    collection: 'users/userA/private/contact',
    operation: 'get',
    authUid: 'userB',
    emailVerified: true,
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Unfiltered List Scraping on Appointments',
    collection: 'appointments',
    operation: 'list',
    authUid: 'userB',
    emailVerified: true,
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Terminal State Reversal on Appointment',
    collection: 'appointments/apt_cancelled',
    operation: 'update',
    authUid: 'userA',
    emailVerified: true,
    payload: {
      status: 'confirmed',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Update-Gap Value Poisoning',
    collection: 'appointments/apt_1',
    operation: 'update',
    authUid: 'userA',
    emailVerified: true,
    payload: {
      status: 'invalid_state_999',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Temporal Forgery on SavedReference',
    collection: 'saved_references/ref_1',
    operation: 'create',
    authUid: 'userA',
    emailVerified: true,
    payload: {
      id: 'ref_1',
      userId: 'userA',
      haircutId: 'cut_low_fade',
      haircutName: 'Low Fade',
      category: 'Fade',
      imageUrl: '/img.jpg',
      notes: 'Forged timestamp',
      createdAt: '2020-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'ID Poisoning Attack',
    collection: 'users/invalid$id!@#',
    operation: 'create',
    authUid: 'invalid$id!@#',
    emailVerified: true,
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Array Exhaustion Attack on favoriteCutIds',
    collection: 'users/userA',
    operation: 'update',
    authUid: 'userA',
    emailVerified: true,
    payload: {
      favoriteCutIds: new Array(100).fill('cut_low_fade'),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Unauthorized Catalog Mutation on Services',
    collection: 'services/srv_corte',
    operation: 'update',
    authUid: 'userA',
    emailVerified: true,
    payload: {
      price: 1,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Immutable Field Mutation on UserProfile',
    collection: 'users/userA',
    operation: 'update',
    authUid: 'userA',
    emailVerified: true,
    payload: {
      uid: 'userB',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
