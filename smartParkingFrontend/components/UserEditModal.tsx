
import React, { useState } from 'react';
import { User } from '../types';

interface UserEditModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    age: user.age?.toString() || '',
    phoneNumber: user.phoneNumber || '',
    email: user.email || '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('변경할 비밀번호가 일치하지 않습니다.');
      return;
    }
    onUpdate({
      ...user,
      name: formData.name,
      age: parseInt(formData.age),
      phoneNumber: formData.phoneNumber,
      email: formData.email
    });
    alert('회원 정보가 성공적으로 수정되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
      <div className="bg-white rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl animate-scaleIn">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-slate-900">회원 정보 수정</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-600 transition-colors">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">아이디 (변경 불가)</label>
            <input
              type="text"
              className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 font-bold outline-none cursor-not-allowed"
              value={user.username}
              disabled
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">이름</label>
              <input
                type="text"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">나이</label>
              <input
                type="number"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">전화번호</label>
            <input
              type="tel"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              value={formData.phoneNumber}
              onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">이메일 주소</label>
            <input
              type="email"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-50">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">비밀번호 변경</label>
            <div className="space-y-3">
              <input
                type="password"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                placeholder="새 비밀번호"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <input
                type="password"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                placeholder="새 비밀번호 확인"
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl font-bold text-slate-400 bg-slate-100 transition">취소</button>
            <button type="submit" className="flex-1 py-4 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all transform hover:-translate-y-1">저장하기</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
