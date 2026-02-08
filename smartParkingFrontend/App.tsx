import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserHistory from './pages/UserHistory';
import Navbar from './components/Navbar';
import UserEditModal from './components/UserEditModal';
import { User, UserRole } from './types';
import { MOCK_USERS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('parking_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('parking_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    setCurrentUser(null);
    localStorage.removeItem('parking_user');
  };

  const handleRegister = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  // ✅ 백엔드 UserUpdateRequestDto에 정확히 맞춘 PUT
  const handleUpdateProfile = async (
    updatedUser: User,
    currentPassword?: string,
    newPassword?: string
  ) => {
    try {
      // 백엔드 DTO: { currentPassword, newPassword, name, age, email, phone }
      const body: Record<string, any> = {
        name: updatedUser.name,
        age: updatedUser.age,
        email: updatedUser.email,
        phone: updatedUser.phoneNumber,
      };

      // 비밀번호 변경할 때만 포함
      if (newPassword && newPassword.trim()) {
        body.currentPassword = (currentPassword ?? '').trim();
        body.newPassword = newPassword.trim();
      }

      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '수정 실패');
        alert(msg);
        return;
      }

      // ✅ 성공 시 프론트 상태도 갱신
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
      localStorage.setItem('parking_user', JSON.stringify(updatedUser));

      alert('회원 정보가 성공적으로 수정되었습니다.');
    } catch {
      alert('서버와 통신할 수 없습니다.');
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
              element={
                !currentUser ? (
                  <LoginPage onLogin={handleLogin} onRegister={handleRegister} users={users} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            <Route
              path="/"
              element={
                currentUser ? (
                  currentUser.role === UserRole.ADMIN ? (
                    <AdminDashboard slots={[]} reservations={[]} users={users} />
                  ) : (
                    <UserDashboard userId={currentUser.id} />
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
                  <UserHistory userId={currentUser.id} />
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
