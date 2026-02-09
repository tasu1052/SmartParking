// src/types.ts

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  age?: number;
  phoneNumber?: string;
  email?: string;
}

/**
 * ✅ 백엔드 ReservationStatus 기준으로 통일
 * - RESERVED, CANCELED, COMPLETED
 */
export type ReservationStatus = 'RESERVED' | 'CANCELED' | 'COMPLETED';

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  slotId: number;
  carNumber: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  // 필요하면 durationHours 같은 필드도 여기 추가 가능
  durationHours?: number;
}

export interface ParkingSlot {
  id: number;
  label: string;
  isOccupied: boolean;
  currentReservation?: Reservation;
}
