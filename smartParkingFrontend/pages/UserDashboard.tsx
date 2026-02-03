
import React, { useState, useEffect } from 'react';
import { ParkingSlot, Reservation } from '../types';

interface UserDashboardProps {
  slots: ParkingSlot[];
  reservations: Reservation[];
  userId: string;
  onReserve: (slotId: number, carNumber: string, startTime: string, endTime: string) => void;
  onCancel: (resId: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ slots, onReserve, onCancel, reservations, userId }) => {
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [carNumber, setCarNumber] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (selectedSlot) {
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
      const formatLocal = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
      };
      setStartTime(formatLocal(now));
      setEndTime(formatLocal(inOneHour));
    }
  }, [selectedSlot]);

  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.isOccupied) {
      alert('이미 주차된 공간으로 선택할 수 없습니다.');
      return;
    }
    setSelectedSlot(slot);
  };

  const handleReserveSubmit = () => {
    if (!carNumber.trim()) { alert('차량 번호를 입력해주세요.'); return; }
    if (!startTime || !endTime) { alert('시간을 선택해주세요.'); return; }
    if (new Date(startTime) >= new Date(endTime)) { alert('종료 시간은 시작 시간보다 늦어야 합니다.'); return; }

    if (selectedSlot) {
      onReserve(selectedSlot.id, carNumber, startTime, endTime);
      setSelectedSlot(null);
      setCarNumber('');
      setShowSuccessModal(true);
    }
  };

  const handleCancelInput = () => {
    if (window.confirm('정말 취소하시겠습니까?')) {
      setSelectedSlot(null);
      setCarNumber('');
    }
  };

  const slotsRow1 = slots.slice(0, 10);
  const slotsRow2 = slots.slice(10, 20);

  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-8 lg:p-10">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">주차 공간 작도</h1>
        <p className="text-slate-400 mt-2 font-medium">실시간 주차면 현황을 확인하고 예약하세요.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-50 relative overflow-hidden">
            {/* Legend */}
            <div className="flex justify-between items-center mb-12">
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-100"></div>
                  <span className="text-xs font-bold text-slate-500">예약 가능 (🟢)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-100"></div>
                  <span className="text-xs font-bold text-slate-500">주차 중 (🔴)</span>
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest">Floor Plan v1.0</div>
            </div>

            {/* Parking Blueprint (작도) */}
            <div className="bg-slate-50 rounded-[2rem] p-10 border-4 border-slate-100 flex flex-col gap-12 relative">
              {/* Row A */}
              <div className="grid grid-cols-5 gap-6">
                {slotsRow1.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotClick(slot)}
                    className={`
                      aspect-[3/4] rounded-xl border-2 flex flex-col items-center justify-center transition-all group relative
                      ${slot.isOccupied 
                        ? 'bg-white border-red-400 text-red-500 cursor-not-allowed shadow-sm' 
                        : 'bg-white border-green-400 text-green-600 hover:scale-105 hover:shadow-xl hover:shadow-green-100 shadow-md'
                      }
                      ${selectedSlot?.id === slot.id ? 'ring-8 ring-blue-50 border-blue-600 !scale-110 z-10' : ''}
                    `}
                  >
                    <span className="absolute top-2 left-2 text-[9px] font-black opacity-30">{slot.label}</span>
                    <i className={`fas ${slot.isOccupied ? 'fa-car' : 'fa-parking'} text-3xl mb-1`}></i>
                    <span className="text-[10px] font-black">{slot.isOccupied ? 'BUSY' : 'FREE'}</span>
                  </button>
                ))}
              </div>

              {/* Central Aisle */}
              <div className="h-20 bg-slate-200/50 rounded-2xl flex items-center justify-center border-y-4 border-dashed border-slate-300">
                <span className="text-xs font-black text-slate-400 uppercase tracking-[1.5em] opacity-50 pl-6">Main Aisle</span>
              </div>

              {/* Row B */}
              <div className="grid grid-cols-5 gap-6">
                {slotsRow2.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotClick(slot)}
                    className={`
                      aspect-[3/4] rounded-xl border-2 flex flex-col items-center justify-center transition-all group relative
                      ${slot.isOccupied 
                        ? 'bg-white border-red-400 text-red-500 cursor-not-allowed shadow-sm' 
                        : 'bg-white border-green-400 text-green-600 hover:scale-105 hover:shadow-xl hover:shadow-green-100 shadow-md'
                      }
                      ${selectedSlot?.id === slot.id ? 'ring-8 ring-blue-50 border-blue-600 !scale-110 z-10' : ''}
                    `}
                  >
                    <i className={`fas ${slot.isOccupied ? 'fa-car' : 'fa-parking'} text-3xl mb-1`}></i>
                    <span className="text-[10px] font-black">{slot.isOccupied ? 'BUSY' : 'FREE'}</span>
                    <span className="absolute bottom-2 left-2 text-[9px] font-black opacity-30">{slot.label}</span>
                  </button>
                ))}
              </div>

              {/* Drawing Grid lines overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] grid grid-cols-12 grid-rows-12">
                {Array.from({ length: 144 }).map((_, i) => <div key={i} className="border border-slate-900"></div>)}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Reservation Form */}
        <div className="lg:col-span-1">
          {selectedSlot ? (
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border-t-8 border-blue-600 sticky top-24 animate-fadeIn">
              <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">주차 예약 등록</h3>
              <div className="space-y-6">
                <div className="bg-blue-50 px-5 py-4 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase">선택 구역</p>
                  <p className="text-2xl font-black text-blue-800">{selectedSlot.label}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">차량 번호</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-lg focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="12가 3456"
                    value={carNumber}
                    onChange={e => setCarNumber(e.target.value)}
                  />
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">입차 시간</label>
                    <input type="datetime-local" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">출차 예정</label>
                    <input type="datetime-local" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
                <div className="pt-4 space-y-3">
                  <button onClick={handleReserveSubmit} className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">예약하기</button>
                  <button onClick={handleCancelInput} className="w-full py-3 text-slate-400 font-bold hover:text-red-500 transition-colors">취소하기</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 p-10 flex flex-col items-center justify-center text-center h-[500px]">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <i className="fas fa-arrow-left text-3xl text-slate-300"></i>
              </div>
              <h4 className="text-lg font-black text-slate-800">구역을 선택하세요</h4>
              <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">왼쪽 작도에서 예약 가능한<br/><span className="text-green-500">초록색 주차면</span>을 클릭하세요.</p>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] max-w-sm w-full p-10 shadow-2xl text-center animate-scaleIn">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <i className="fas fa-check text-4xl"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">예약되었습니다</h3>
            <p className="text-slate-400 font-medium mb-10 text-sm">주차 공간이 정상적으로 확보되었습니다.<br/>이용 시간에 맞춰 방문해 주세요.</p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-100">확인</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
