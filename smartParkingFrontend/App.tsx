
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserHistory from './pages/UserHistory';
import Navbar from './components/Navbar';
import UserEditModal from './components/UserEditModal';
import { User, UserRole, ParkingSlot, Reservation } from './types';
import { INITIAL_SLOTS, MOCK_USERS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [slots, setSlots] = useState<ParkingSlot[]>(INITIAL_SLOTS);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Initialize data
  useEffect(() => {
    const savedUser = localStorage.getItem('parking_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    // Initial mock reservations to match INITIAL_SLOTS state
    const initialReservations: Reservation[] = slots
      .filter(s => s.isOccupied)
      .map((s, idx) => {
        const now = new Date();
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        return {
          id: `res-init-${idx}`,
          userId: '99',
          userName: '외부차량',
          slotId: s.id,
          carNumber: `12가 ${1234 + idx}`,
          startTime: now.toISOString(),
          endTime: twoHoursLater.toISOString(),
          status: 'ACTIVE'
        };
      });
    setReservations(initialReservations);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('parking_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('parking_user');
  };

  const handleRegister = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    localStorage.setItem('parking_user', JSON.stringify(updatedUser));
  };

  const handleReserve = (slotId: number, carNumber: string, startTime: string, endTime: string) => {
    if (!currentUser) return;

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      slotId: slotId,
      carNumber: carNumber,
      startTime: startTime,
      endTime: endTime,
      status: 'ACTIVE'
    };

    setReservations(prev => [...prev, newReservation]);
    setSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, isOccupied: true } : slot
    ));
  };

  const handleCancelReservation = (resId: string) => {
    const resToCancel = reservations.find(r => r.id === resId);
    if (!resToCancel) return;

    if (window.confirm('정말 예약을 취소하시겠습니까?')) {
      setReservations(prev => prev.map(r => 
        r.id === resId ? { ...r, status: 'CANCELLED' } : r
      ));
      setSlots(prev => prev.map(slot => 
        slot.id === resToCancel.slotId ? { ...slot, isOccupied: false } : slot
      ));
      alert('예약이 정상적으로 취소되었습니다.');
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        {currentUser && (
          <Navbar 
            user={currentUser} 
            onLogout={handleLogout} 
            onEditProfile={() => setIsEditModalOpen(true)} 
          />
        )}
        <main className="flex-grow">
          <Routes>
            <Route 
              path="/login" 
              element={!currentUser ? <LoginPage onLogin={handleLogin} onRegister={handleRegister} users={users} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={
                currentUser ? (
                  currentUser.role === UserRole.ADMIN ? (
                    <AdminDashboard slots={slots} reservations={reservations} users={users} />
                  ) : (
                    <UserDashboard 
                      slots={slots} 
                      onReserve={handleReserve} 
                      onCancel={handleCancelReservation}
                      reservations={reservations} 
                      userId={currentUser.id}
                    />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/history" 
              element={
                currentUser && currentUser.role === UserRole.USER ? (
                  <UserHistory 
                    userId={currentUser.id} 
                    reservations={reservations} 
                    onCancel={handleCancelReservation}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
          </Routes>
        </main>
        
        {isEditModalOpen && currentUser && (
          <UserEditModal 
            user={currentUser} 
            onClose={() => setIsEditModalOpen(false)} 
            onUpdate={handleUpdateProfile} 
          />
        )}

        <footer className="bg-gray-800 text-gray-400 py-10 text-center text-sm border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-2 font-bold text-gray-300">
                 <i className="fas fa-parking"></i> Smart Parking System
               </div>
               <p>&copy; 2024 상가 인근 무료 공영 주차장 예약 서비스. All rights reserved.</p>
             </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
