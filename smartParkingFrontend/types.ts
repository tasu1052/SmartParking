
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

export interface ParkingSlot {
  id: number;
  label: string;
  isOccupied: boolean;
  currentReservation?: Reservation;
}

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  slotId: number;
  carNumber: string;
  startTime: string;
  endTime: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}
