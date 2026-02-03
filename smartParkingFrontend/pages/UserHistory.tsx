
import React from 'react';
import { Reservation } from '../types';

interface UserHistoryProps {
  userId: string;
  reservations: Reservation[];
  onCancel: (resId: string) => void;
}

const UserHistory: React.FC<UserHistoryProps> = ({ userId, reservations, onCancel }) => {
  const myReservations = [...reservations].filter(r => r.userId === userId).reverse();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fadeIn">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">나의 예약 이력</h1>
          <p className="text-gray-500 mt-1">이력 확인 및 예약 취소가 가능합니다.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
           <span className="text-xs font-bold text-gray-400">총 이용 횟수: <span className="text-blue-600">{myReservations.length}회</span></span>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {myReservations.length === 0 ? (
          <div className="p-24 text-center">
            <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-calendar-times text-4xl"></i>
            </div>
            <p className="text-xl font-bold text-gray-600">아직 예약 내역이 없습니다.</p>
            <p className="text-gray-400 mt-2">지금 바로 주차 공간을 예약해보세요!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5">날짜 / 시간</th>
                  <th className="px-8 py-5">차량 번호</th>
                  <th className="px-8 py-5">구역 정보</th>
                  <th className="px-8 py-5">상태</th>
                  <th className="px-8 py-5 text-center">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {myReservations.map(res => (
                  <tr key={res.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-gray-900">{new Date(res.startTime).toLocaleDateString()}</p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-mono font-black border border-gray-200 text-gray-700">
                        {res.carNumber}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-blue-600">Slot {res.slotId}</p>
                      <p className="text-[11px] text-gray-400">총 {res.durationHours}시간 이용</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        res.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                        res.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 
                        'bg-red-50 text-red-400'
                      }`}>
                        {res.status === 'ACTIVE' ? '이용 중' : res.status === 'COMPLETED' ? '종료됨' : '취소됨'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {res.status === 'ACTIVE' && (
                        <button
                          onClick={() => onCancel(res.id)}
                          className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2 rounded-xl text-xs font-black transition-all transform hover:scale-105"
                        >
                          예약 취소
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-12 bg-indigo-600 rounded-[2.5rem] p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-indigo-200 overflow-hidden relative">
        <div className="relative z-10">
          <h4 className="text-3xl font-black mb-2 tracking-tight">스마트 파킹과 함께 더 편하게</h4>
          <p className="text-indigo-100 opacity-80 text-lg">실시간 예약 확인부터 간편한 취소까지 한 번에 관리하세요.</p>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default UserHistory;
