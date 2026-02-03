
import React, { useState } from 'react';
import { User, UserRole } from '../types';
console.log('🔥 LoginPage version: 2026-02-03 v1');
interface LoginPageProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  users: User[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, users }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [regData, setRegData] = useState({
    id: '',
    password: '',
    name: '',
    age: '',
    phone: '',
    email: ''
  });

const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: username,
        password: password
      })
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setError(data?.message ?? '아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    const loggedInUser: User = {
      id: data.userId,          // 프론트 식별용
      username: data.userId,
      name: '',                 // 로그인 응답에 없음 → 이후 /users/me에서 채움
      role: data.role as UserRole,
      age: undefined,
      phoneNumber: undefined,
      email: undefined
    };

    onLogin(loggedInUser);
  } catch {
    setError('서버와 통신할 수 없습니다.');
  }
};

  const handleRegisterSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!regData.id || !regData.password || !regData.name || !regData.age || !regData.phone || !regData.email) {
    alert('모든 필수 정보를 입력해주세요.');
    return;
  }

  try {
    const res = await fetch('/api/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: regData.id,
        userName: regData.name,
        password: regData.password,
        email: regData.email,
        phoneNumber: regData.phone,
        age: Number(regData.age)
      })
    });

    if (!res.ok) {
      const msg = await res.text();
      alert(msg || '회원가입 실패');
      return;
    }

    alert('회원가입이 완료되었습니다! 이제 로그인해주세요.');
    setIsRegister(false);
    setRegData({ id: '', password: '', name: '', age: '', phone: '', email: '' });
  } catch {
    alert('서버와 통신할 수 없습니다.');
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-3xl mb-4 shadow-xl shadow-blue-200">
            <i className="fas fa-parking text-4xl"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">무료 공영 주차장</h2>
          <p className="mt-2 text-slate-400 font-medium">실시간 주차 공간 예약 서비스</p>
        </div>

        {!isRegister ? (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}
            <input
              type="text"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all font-medium"
              placeholder="아이디"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all font-medium"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all transform hover:-translate-y-1"
            >
              로그인
            </button>
            <div className="text-center pt-4">
              <button type="button" onClick={() => setIsRegister(true)} className="text-sm font-bold text-slate-400 hover:text-blue-600">
                신규 회원가입
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="아이디"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              value={regData.id}
              onChange={e => setRegData({...regData, id: e.target.value})}
            />
            <input
              type="password"
              placeholder="비밀번호"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              value={regData.password}
              onChange={e => setRegData({...regData, password: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="이름"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                value={regData.name}
                onChange={e => setRegData({...regData, name: e.target.value})}
              />
              <input
                type="number"
                placeholder="나이"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                value={regData.age}
                onChange={e => setRegData({...regData, age: e.target.value})}
              />
            </div>
            <input
              type="tel"
              placeholder="전화번호"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              value={regData.phone}
              onChange={e => setRegData({...regData, phone: e.target.value})}
            />
            <input
              type="email"
              placeholder="이메일 주소"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              value={regData.email}
              onChange={e => setRegData({...regData, email: e.target.value})}
            />
            <div className="pt-6 flex flex-col gap-3">
              <button type="submit" className="w-full py-4 rounded-xl bg-slate-900 text-white font-black hover:bg-black transition-all">
                회원가입 완료
              </button>
              <button type="button" onClick={() => setIsRegister(false)} className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition">
                취소
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
