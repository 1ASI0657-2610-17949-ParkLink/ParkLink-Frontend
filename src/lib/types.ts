/**
 * ParkLink — Tipos compartidos
 *
 * Single source of truth para todas las interfaces que vienen del backend.
 * Si el backend agrega un campo, lo agregás acá y se propaga a toda la app.
 */

// ============================================================================
// Roles
// ============================================================================

export const USER_ROLES = {
  DRIVER: 'DRIVER',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ============================================================================
// Auth
// ============================================================================

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  plateNumber: string | null;
  ownerType: string | null;
  bankAccount: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  user: PublicUser;
}

export interface RegisterDriverDto {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  plateNumber: string;
}

export interface RegisterOwnerDto {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  ownerType: string;
  bankAccount: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
  plateNumber?: string;
  ownerType?: string;
  bankAccount?: string;
}

// ============================================================================
// Parking Spaces
// ============================================================================

export const PARKING_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  OCCUPIED: 'OCCUPIED',
  DISABLED: 'DISABLED',
} as const;

export type ParkingSpaceStatus = (typeof PARKING_STATUS)[keyof typeof PARKING_STATUS];

export interface ParkingSpaceRecord {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  reference: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
  openingTime: string;
  closingTime: string;
  status: ParkingSpaceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingSpaceWithDistance extends ParkingSpaceRecord {
  distanceKm?: number;
}

export interface CreateParkingSpaceDto {
  name: string;
  address: string;
  reference: string;
  pricePerHour: number;
  openingTime: string;
  closingTime: string;
}

export interface UpdateParkingSpaceDto {
  name?: string;
  address?: string;
  reference?: string;
  pricePerHour?: number;
  openingTime?: string;
  closingTime?: string;
}

export interface ParkingSpaceSearchParams {
  lat?: number;
  lng?: number;
  maxDistance?: number;
  minPrice?: number;
  maxPrice?: number;
  startTime?: string;
  endTime?: string;
  status?: ParkingSpaceStatus;
}

// ============================================================================
// Reservations
// ============================================================================

export const RESERVATION_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type ReservationStatus = (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

export interface ReservationRecord {
  id: string;
  userId: string;
  parkingSpaceId: string;
  reservationCode: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationDto {
  parkingSpaceId: string;
  startTime: string;
  endTime: string;
}

export interface CancelReservationDto {
  reason: string;
}

export interface ExtendReservationDto {
  newEndTime: string;
}

// ============================================================================
// Payments
// ============================================================================

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REFUNDED: 'REFUNDED',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export interface PaymentRecord {
  id: string;
  reservationId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  receiptCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  reservationId: string;
  amount: number;
  paymentMethod: string;
  forceResult?: 'APPROVED' | 'REJECTED';
}

export interface RefundPaymentDto {
  reason: string;
}

// ============================================================================
// Notifications
// ============================================================================

export const NOTIFICATION_TYPE = {
  RESERVATION_CONFIRMED: 'RESERVATION_CONFIRMED',
  PAYMENT_APPROVED: 'PAYMENT_APPROVED',
  RESERVATION_CANCELLED: 'RESERVATION_CANCELLED',
  RESERVATION_EXPIRING: 'RESERVATION_EXPIRING',
  REFUND_PROCESSED: 'REFUND_PROCESSED',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

// ============================================================================
// Maps
// ============================================================================

export interface GeocodeResult {
  address: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

export interface ReverseGeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId: string;
}

export interface DistanceResult {
  origin: string;
  destination: string;
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
}

export interface DirectionsStep {
  instruction: string;
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
  startLocation: { latitude: number; longitude: number };
  endLocation: { latitude: number; longitude: number };
}

export interface DirectionsResult {
  origin: string;
  destination: string;
  summary: string;
  travelMode: string;
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
  overviewPolyline: string;
  steps: DirectionsStep[];
}

// ============================================================================
// API response wrapper
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
  timestamp?: string;
  path?: string;
}
