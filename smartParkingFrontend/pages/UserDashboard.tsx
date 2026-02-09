// src/pages/UserDashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { ParkingSlot, Reservation, ReservationStatus } from '../types';

interface UserDashboardProps {
  userId: string; // 화면 표시용(서버는 세션으로 유저 식별)
}

// ✅ 네가 만든 테스트 주차장 id가 3이면 3
const PARKING_LOT_ID = 3;

// ✅ ParkingSpotResponseDto 응답 타입
type SpotApi = {
  id: number;
  spotNumber: number;
  available: boolean;
};

// ✅ Reservation 엔티티 그대로 내려올 때(연관관계 포함)를 최대한 커버
type ReservationApi = {
  id: number | string;
  carNumber?: string;
  startTime?: string;
  endTime?: string;
  status?: string;

  parkingSpotId?: number;
  parkingSpot?: { id: number; spotNumber?: number };
  spotId?: number;
  spot?: { id: number };
};

// ✅ 현재 예약은 RESERVED
const CURRENT_STATUS: ReservationStatus = 'RESERVED';

function normalizeStatus(s?: string): ReservationStatus {
  if (s === 'RESERVED' || s === 'CANCELED' || s === 'COMPLETED') return s;
  return 'RESERVED';
}

function calcDurationHours(startISO?: string, endISO?: string) {
  if (!startISO || !endISO) return 0;
  const diff = new Date(endISO).getTime() - new Date(startISO).getTime();
  if (Number.isNaN(diff) || diff <= 0) return 0;
  return Math.round(diff / (1000 * 60 * 60));
}

// ✅ datetime-local("YYYY-MM-DDTHH:mm") -> LocalDateTime("YYYY-MM-DDTHH:mm:00")
function toLocalDateTimeString(dtLocal: string) {
  if (!dtLocal) return dtLocal;
  return dtLocal.length === 16 ? `${dtLocal}:00` : dtLocal;
}

function formatLocalInput(date: Date) {
  // datetime-local에 넣기 위한 "YYYY-MM-DDTHH:mm"
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

const UserDashboard: React.FC<UserDashboardProps> = ({ userId }) => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  const [carNumber, setCarNumber] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const [spotsRes, curRes] = await Promise.all([
        fetch(`/parking-lots/${PARKING_LOT_ID}/spots`, { credentials: 'include' }),
        fetch(`/reservations/me/current`, { credentials: 'include' }),
      ]);

      if (!spotsRes.ok) {
        const msg = await spotsRes.text().catch(() => '주차면 조회 실패');
        alert(msg);
        return;
      }

      // 1) spots
      const spotJson: SpotApi[] = await spotsRes.json();
      const mappedSlots: ParkingSlot[] = spotJson
        .sort((a, b) => a.spotNumber - b.spotNumber)
        .map(s => ({
          id: s.id,
          label: `S${s.spotNumber}`,
          isOccupied: !s.available,
        }));

      // 2) reservations (현재 예약)
      let mappedReservations: Reservation[] = [];

      if (curRes.ok) {
        const curJson: ReservationApi[] = await curRes.json();

        mappedReservations = curJson.map(r => {
          const slotId =
            r.parkingSpotId ??
            r.parkingSpot?.id ??
            r.spotId ??
            r.spot?.id ??
            0;

          const startISO = r.startTime ?? '';
          const endISO = r.endTime ?? '';
          const status = normalizeStatus(r.status);

          return {
            id: String(r.id),
            userId,
            userName: '',
            slotId,
            carNumber: r.carNumber ?? '',
            startTime: startISO,
            endTime: endISO,
            status,
            durationHours: calcDurationHours(startISO, endISO),
          };
        });

        // ✅ 서버 spot available 계산이 혹시 늦게 반영될 수 있으니,
        // 현재 예약(RESERVED)인 spot은 강제로 점유 처리
        const reservedSet = new Set(
          mappedReservations.filter(r => r.status === CURRENT_STATUS).map(r => r.slotId)
        );

        setSlots(mappedSlots.map(s => ({ ...s, isOccupied: s.isOccupied || reservedSet.has(s.id) })));
      } else {
        // 401이면 로그인 안 된 상태거나, 오류면 spots만 보여줌
        setSlots(mappedSlots);
      }

      setReservations(mappedReservations);
    } catch {
      alert('서버와 통신할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // 슬롯 선택 시 기본 시간 자동 세팅
  useEffect(() => {
    if (!selectedSlot) return;
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    setStartTime(formatLocalInput(now));
    setEndTime(formatLocalInput(inOneHour));
  }, [selectedSlot]);

  const slotsRow1 = slots.slice(0, 10);
  const slotsRow2 = slots.slice(10, 20);

  const myCurrentReservations = useMemo(
    () => reservations.filter(r => r.status === CURRENT_STATUS),
    [reservations]
  );

  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.isOccupied) {
      alert('이미 주차된 공간으로 선택할 수 없습니다.');
      return;
    }
    setSelectedSlot(slot);
  };

  const handleReserveSubmit = async () => {
    if (!selectedSlot) return;

    if (!carNumber.trim()) {
      alert('차량 번호를 입력해주세요.');
      return;
    }
    if (!startTime || !endTime) {
      alert('시간을 선택해주세요.');
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    try {
      const res = await fetch('/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          parkingSpotId: selectedSlot.id,
          carNumber: carNumber.trim(),
          startTime: toLocalDateTimeString(startTime),
          endTime: toLocalDateTimeString(endTime),
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '예약 실패');
        alert(msg);
        return;
      }

      setSelectedSlot(null);
      setCarNumber('');
      setShowSuccessModal(true);
      await refresh();
    } catch {
      alert('서버와 통신할 수 없습니다.');
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!window.confirm('정말 예약을 취소하시겠습니까?')) return;

    try {
      const res = await fetch(`/reservations/${reservationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '예약 취소 실패');
        alert(msg);
        return;
      }

      alert('예약이 정상적으로 취소되었습니다.');
      await refresh();
    } catch {
      alert('서버와 통신할 수 없습니다.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-10">
        <div className="bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-50">
          <p className="text-slate-500 font-bold">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-8 lg:p-10">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">주차 공간 작도</h1>
        <p className="text-slate-400 mt-2 font-medium">실시간 주차면 현황을 확인하고 예약하세요.</p>

        {myCurrentReservations.length > 0 && (
          <div className="mt-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <p className="text-sm font-black text-slate-700 mb-3">현재 이용 중인 예약</p>
            <div className="flex flex-col gap-2">
              {myCurrentReservations.map(r => (
                <div key={r.id} className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3">
                  <div className="text-sm font-bold text-slate-700">
                    Spot {r.slotId} · {r.carNumber}
                  </div>
                  <button
                    onClick={() => handleCancelReservation(r.id)}
                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition"
                  >
                    예약 취소
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* ===== 왼쪽: 작도 ===== */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-50 relative overflow-hidden">
            <div className="flex justify-between items-center mb-12">
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-100" />
                  <span className="text-xs font-bold text-slate-500">예약 가능 (🟢)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-100" />
                  <span className="text-xs font-bold text-slate-500">예약 불가 (🔴)</span>
                </div>
              </div>
              <button
                onClick={refresh}
                className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100"
                title="새로고침"
              >
                Refresh
              </button>
            </div>

            {/* ✅ slots가 비어있으면 안내 */}
            {slots.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-10 border border-slate-100 text-center">
                <p className="text-slate-500 font-bold">주차면 데이터가 없습니다.</p>
                <p className="text-slate-400 text-sm mt-2">
                  DB에 parking_spot이 생성되어 있는지, PARKING_LOT_ID가 맞는지 확인해 주세요.
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-[2rem] p-10 border-4 border-slate-100 flex flex-col gap-12 relative">
                {/* 윗줄 10칸 */}
                <div className="grid grid-cols-5 gap-6">
                  {slotsRow1.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      className={`
                        aspect-[3/4] rounded-xl border-2 flex flex-col items-center justify-center transition-all relative
                        ${slot.isOccupied
                          ? 'bg-white border-red-400 text-red-500 cursor-not-allowed shadow-sm'
                          : 'bg-white border-green-400 text-green-600 hover:scale-105 hover:shadow-xl hover:shadow-green-100 shadow-md'
                        }
                        ${selectedSlot?.id === slot.id ? 'ring-8 ring-blue-50 border-blue-600 !scale-110 z-10' : ''}
                      `}
                    >
                      <span className="absolute top-2 left-2 text-[9px] font-black opacity-30">{slot.label}</span>
                      <div className="text-3xl mb-1">{slot.isOccupied ? '🚗' : '🅿️'}</div>
                      <span className="text-[10px] font-black">{slot.isOccupied ? 'BUSY' : 'FREE'}</span>
                    </button>
                  ))}
                </div>

                {/* 가운데 통로 */}
                <div className="h-20 bg-slate-200/50 rounded-2xl flex items-center justify-center border-y-4 border-dashed border-slate-300">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[1.2em] opacity-50 pl-6">
                    Main Aisle
                  </span>
                </div>

                {/* 아랫줄 10칸 */}
                <div className="grid grid-cols-5 gap-6">
                  {slotsRow2.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      className={`
                        aspect-[3/4] rounded-xl border-2 flex flex-col items-center justify-center transition-all relative
                        ${slot.isOccupied
                          ? 'bg-white border-red-400 text-red-500 cursor-not-allowed shadow-sm'
                          : 'bg-white border-green-400 text-green-600 hover:scale-105 hover:shadow-xl hover:shadow-green-100 shadow-md'
                        }
                        ${selectedSlot?.id === slot.id ? 'ring-8 ring-blue-50 border-blue-600 !scale-110 z-10' : ''}
                      `}
                    >
                      <div className="text-3xl mb-1">{slot.isOccupied ? '🚗' : '🅿️'}</div>
                      <span className="text-[10px] font-black">{slot.isOccupied ? 'BUSY' : 'FREE'}</span>
                      <span className="absolute bottom-2 left-2 text-[9px] font-black opacity-30">{slot.label}</span>
                    </button>
                  ))}
                </div>

                {/* 그리드 배경 느낌 */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] grid grid-cols-12 grid-rows-12">
                  {Array.from({ length: 144 }).map((_, i) => (
                    <div key={i} className="border border-slate-900" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== 오른쪽: 예약 패널 ===== */}
        <div className="lg:col-span-1">
          {selectedSlot ? (
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border-t-8 border-blue-600 sticky top-24">
              <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">주차 예약 등록</h3>

              <div className="space-y-6">
                <div className="bg-blue-50 px-5 py-4 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase">선택 구역</p>
                  <p className="text-2xl font-black text-blue-800">{selectedSlot.label}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">
                    차량 번호
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-lg focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="12가3456"
                    value={carNumber}
                    onChange={e => setCarNumber(e.target.value)}
                  />
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">
                      입차 시간
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">
                      출차 예정
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={handleReserveSubmit}
                    className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
                  >
                    예약하기
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSlot(null);
                      setCarNumber('');
                    }}
                    className="w-full py-3 text-slate-400 font-bold hover:text-red-500 transition-colors"
                  >
                    취소하기
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 p-10 flex flex-col items-center justify-center text-center h-[500px]">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <span className="text-3xl text-slate-300">⬅️</span>
              </div>
              <h4 className="text-lg font-black text-slate-800">구역을 선택하세요</h4>
              <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">
                왼쪽 작도에서 예약 가능한<br />
                <span className="text-green-500">초록색 주차면</span>을 클릭하세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] max-w-sm w-full p-10 shadow-2xl text-center">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="text-4xl">✅</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">예약되었습니다</h3>
            <p className="text-slate-400 font-medium mb-10 text-sm">
              주차 공간이 정상적으로 확보되었습니다.<br />
              이용 시간에 맞춰 방문해 주세요.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-100"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
