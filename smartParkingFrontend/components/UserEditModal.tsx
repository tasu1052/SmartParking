import React, { useEffect, useState } from 'react';
import { User } from '../types';

interface UserEditModalProps {
  user: User;
  onClose: () => void;
  // ✅ (updatedUser, currentPassword, newPassword)
  onUpdate: (updatedUser: User, currentPassword?: string, newPassword?: string) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name ?? '',
    age: user.age?.toString() ?? '',
    phoneNumber: user.phoneNumber ?? '',
    email: user.email ?? '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 모달이 열려있는 동안 user가 바뀌면 폼도 동기화
  useEffect(() => {
    setFormData({
      name: user.name ?? '',
      age: user.age?.toString() ?? '',
      phoneNumber: user.phoneNumber ?? '',
      email: user.email ?? '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return alert('이름을 입력해주세요.');
    const parsedAge = Number(formData.age);
    if (!Number.isFinite(parsedAge) || parsedAge <= 0) return alert('나이를 올바르게 입력해주세요.');
    if (!formData.phoneNumber.trim()) return alert('전화번호를 입력해주세요.');
    if (!formData.email.trim()) return alert('이메일을 입력해주세요.');

    // ✅ 비번 변경 여부
    const wantsPwChange =
      formData.currentPassword.trim().length > 0 ||
      formData.newPassword.trim().length > 0 ||
      formData.confirmPassword.trim().length > 0;

    if (wantsPwChange) {
      if (!formData.currentPassword.trim()) return alert('현재 비밀번호를 입력해주세요.');
      if (!formData.newPassword.trim() || !formData.confirmPassword.trim())
        return alert('새 비밀번호와 확인을 모두 입력해주세요.');
      if (formData.newPassword !== formData.confirmPassword)
        return alert('변경할 비밀번호가 일치하지 않습니다.');
      if (formData.newPassword.trim().length < 4)
        return alert('비밀번호는 최소 4자 이상으로 입력해주세요.');
    }

    const updatedUser: User = {
      ...user,
      name: formData.name.trim(),
      age: parsedAge,
      phoneNumber: formData.phoneNumber.trim(),
      email: formData.email.trim(),
    };

    onUpdate(
      updatedUser,
      wantsPwChange ? formData.currentPassword : undefined,
      wantsPwChange ? formData.newPassword : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
      <div className="bg-white rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl animate-scaleIn">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-slate-900">회원 정보 수정</h3>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-600 transition-colors"
            type="button"
          >
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">
              아이디 (변경 불가)
            </label>
            <input
              type="text"
              className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 font-bold outline-none cursor-not-allowed"
              value={user.username}
              disabled
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">
                이름
              </label>
              <input
                type="text"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">
                나이
              </label>
              <input
                type="number"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
                required
                min={1}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">
              전화번호
            </label>
            <input
              type="tel"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              value={formData.phoneNumber}
              onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">
              이메일 주소
            </label>
            <input
              type="email"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-50">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">
              비밀번호 변경 (선택)
            </label>

            <div className="space-y-3">
              <input
                type="password"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                placeholder="현재 비밀번호"
                value={formData.currentPassword}
                onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
              />
              <input
                type="password"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                placeholder="새 비밀번호"
                value={formData.newPassword}
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
              />
              <input
                type="password"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                placeholder="새 비밀번호 확인"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <p className="text-[11px] text-slate-400 font-medium">
                비밀번호를 변경하지 않으려면 세 칸을 모두 비워두세요.
              </p>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-xl font-bold text-slate-400 bg-slate-100 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-4 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all transform hover:-translate-y-1"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
