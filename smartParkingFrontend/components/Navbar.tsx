import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onEditProfile: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onEditProfile }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  const displayName = (user.name && user.name.trim().length > 0)
    ? user.name
    : (user.username || '사용자');

  const roleLabel = user.role === UserRole.ADMIN ? '관리자' : '사용자';

  return (
    <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <i className="fas fa-parking text-2xl"></i>
            <span className="font-bold text-xl tracking-tight">SmartParking</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-blue-200 transition">대시보드</Link>
            {user.role === UserRole.USER && (
              <Link to="/history" className="hover:text-blue-200 transition">예약 이력</Link>
            )}

            <div className="flex items-center gap-3 border-l border-blue-500 pl-6">
              {/* ✅ "OOO님(사용자)" 전체가 클릭되게 */}
              <button
                onClick={onEditProfile}
                className="text-sm font-semibold hover:underline cursor-pointer"
                title="회원 정보 수정"
                type="button"
              >
                {displayName}님 ({roleLabel})
              </button>

              <button
                onClick={handleLogoutClick}
                className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition"
                type="button"
              >
                로그아웃
              </button>
            </div>
          </div>

          <div className="md:hidden">
            <button className="text-white" type="button">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
