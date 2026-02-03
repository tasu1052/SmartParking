
import React, { useState } from 'react';
import { ParkingSlot, Reservation, User } from '../types';

interface AdminDashboardProps {
  slots: ParkingSlot[];
  reservations: Reservation[];
  users: User[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ slots, reservations, users }) => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'users'>('blueprint');

  const activeReservations = reservations.filter(r => r.status === 'ACTIVE');

  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-8 lg:p-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">관리자 대시보드</h1>
          <p className="text-slate-400 mt-2 font-medium">전체 주차장 작도 및 사용자 정보를 모니터링합니다.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button onClick={() => setActiveTab('blueprint')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'blueprint' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>주차장 작도</button>
          <button onClick={() => setActiveTab('users')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'users' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>회원 관리</button>
        </div>
      </header>

      {activeTab === 'blueprint' ? (
        <div className="grid grid-cols-1 gap-8 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-50">
            <h3 className="text-xl font-black text-slate-900 mb-8 border-l-8 border-blue-600 pl-4">실시간 주차면 관리 작도</h3>
            
            <div className="bg-slate-50 rounded-[2rem] p-10 border-4 border-slate-200 flex flex-col gap-12 relative overflow-hidden">
               {/* Row A */}
              <div className="grid grid-cols-5 gap-6">
                {slots.slice(0, 10).map(slot => {
                  const res = activeReservations.find(r => r.slotId === slot.id);
                  return (
                    <div key={slot.id} className={`aspect-[3/4] rounded-xl border-2 flex flex-col p-3 transition-all relative ${slot.isOccupied ? 'bg-white border-red-500' : 'bg-white border-green-200'}`}>
                      <span className="text-[9px] font-black text-slate-300">{slot.label}</span>
                      {res ? (
                        <div className="flex-grow flex flex-col justify-center text-center">
                          <p className="text-[11px] font-black text-red-600 bg-red-50 rounded py-1 mb-1">{res.carNumber}</p>
                          <p className="text-[10px] font-bold text-slate-700">{res.userName}</p>
                        </div>
                      ) : (
                        <div className="flex-grow flex items-center justify-center opacity-10"><i className="fas fa-parking text-3xl"></i></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Central Aisle */}
              <div className="h-20 bg-slate-200/50 rounded-2xl flex items-center justify-center border-y-4 border-dashed border-slate-300">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2em] opacity-30 pl-8">Safety Zone / Aisle</span>
              </div>

              {/* Row B */}
              <div className="grid grid-cols-5 gap-6">
                {slots.slice(10, 20).map(slot => {
                  const res = activeReservations.find(r => r.slotId === slot.id);
                  return (
                    <div key={slot.id} className={`aspect-[3/4] rounded-xl border-2 flex flex-col p-3 transition-all relative ${slot.isOccupied ? 'bg-white border-red-500' : 'bg-white border-green-200'}`}>
                      {res ? (
                        <div className="flex-grow flex flex-col justify-center text-center">
                          <p className="text-[11px] font-black text-red-600 bg-red-50 rounded py-1 mb-1">{res.carNumber}</p>
                          <p className="text-[10px] font-bold text-slate-700">{res.userName}</p>
                        </div>
                      ) : (
                        <div className="flex-grow flex items-center justify-center opacity-10"><i className="fas fa-parking text-3xl"></i></div>
                      )}
                      <span className="text-[9px] font-black text-slate-300 text-right">{slot.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Technical Drawing Grid */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] grid grid-cols-20 grid-rows-20">
                {Array.from({ length: 400 }).map((_, i) => <div key={i} className="border-[0.5px] border-slate-900"></div>)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-10 py-6">사용자 (ID)</th>
                  <th className="px-10 py-6">나이</th>
                  <th className="px-10 py-6">연락처</th>
                  <th className="px-10 py-6">이메일</th>
                  <th className="px-10 py-6">권한</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-6">
                      <p className="font-black text-slate-900">{user.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">@{user.username}</p>
                    </td>
                    <td className="px-10 py-6 text-sm font-bold text-slate-600">{user.age || '-'}세</td>
                    <td className="px-10 py-6 text-sm font-bold text-slate-600">{user.phoneNumber || '-'}</td>
                    <td className="px-10 py-6 text-sm font-medium text-slate-500">{user.email || '-'}</td>
                    <td className="px-10 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
