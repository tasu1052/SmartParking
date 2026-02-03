
import { ParkingSlot, User, UserRole } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', username: 'user', name: '김철수', age: 32, role: UserRole.USER, phoneNumber: '010-1234-5678', email: 'chul@example.com' },
  { id: '2', username: 'admin', name: '관리자', role: UserRole.ADMIN },
  { id: '3', username: 'park', name: '박영희', age: 28, role: UserRole.USER, phoneNumber: '010-9876-5432', email: 'park@example.com' }
];

export const INITIAL_SLOTS: ParkingSlot[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  label: `${Math.floor(i / 10) === 0 ? 'A' : 'B'}-${(i % 10) + 1}`,
  isOccupied: i % 7 === 0 
}));
