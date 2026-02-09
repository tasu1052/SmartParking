// src/pages/UserHistory.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Reservation, ReservationStatus } from '../types';

interface UserHistoryProps {
  userId: string; // 화면 표시용 (서버는 세션으로 유저 식별)
}

type ReservationApi = {
  id: number | string;
  carNumber?: string;
  startTime?: string;
  endTime?: string;
  status?: string;

  parkingSpotId?: number;
  parkingSpot?: { id: number };
  spotId?: number;
  spot?: { id: number };
};

function normalizeStatus(s?: string): ReservationStatus {
  if (s === 'RESERVED' || s === 'CANCELED' || s === 'COMPLETED') return s;
  // status가 없거나 이상하면 RESERVED로 간주(현재 예약 안 보이는 상황 대비)
  return 'RESERVED';
}

// 백엔드 LocalDateTime이 "YYYY-MM-DD HH:mm:ss"면 Date 파싱이 깨질 수 있어서 보정
function normalizeIsoLike(dt?: string) {
  if (!dt) return '';
  if (dt.includes('T')) return dt;
  if (dt.includes(' ')) return dt.replace(' ', 'T'); // "2026-02-09 12:21:00" -> "2026-02-09T12:21:00"
  return dt;
}

function toMillis(isoLike?: string) {
  const s = normalizeIsoLike(isoLike);
  const t = new Date(s).getTime();
  return Number.isNaN(t) ? NaN : t;
}

function calcDurationHours(startISO?: string, endISO?: string) {
  const s = toMillis(startISO);
  const e = toMillis(endISO);
  if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return 0;
  return Math.round((e - s) / (1000 * 60 * 60));
}

function formatKoreanDateTime(iso?: string) {
  if (!iso) return '-';
  const t = toMillis(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 지금 이용중 판정(현재시간이 start~end 사이)
function isInUseNow(startISO?: string, endISO?: string) {
  const s = toMillis(startISO);
  const e = toMillis(endISO);
  const now = Date.now();
  if (Number.isNaN(s) || Number.isNaN(e)) return false;
  return s <= now && now <= e;
}

function badgeForCurrent() {
  return { label: '이용중', cls: 'bg-green-50 text-green-700 border-green-100' };
}

function badgeForHistory(status: ReservationStatus) {
  switch (status) {
    case 'CANCELED':
      return { label: '취소됨', cls: 'bg-red-50 text-red-700 border-red-100' };
    case 'RESERVED':
      // 혹시 history에도 RESERVED가 섞여오면 표시만 "예약중"으로
      return { label: '예약중', cls: 'bg-blue-50 text-blue-700 border-blue-100' };
    case 'COMPLETED':
    default:
      return { label: '이용완료', cls: 'bg-slate-50 text-slate-700 border-slate-100' };
  }
}

const UserHistory: React.FC<UserHistoryProps> = ({ userId }) => {
  const [current, setCurrent] = useState<Reservation[]>([]);
  const [history, setHistory] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const mapOne = (r: ReservationApi): Reservation => {
    const slotId = r.parkingSpotId ?? r.parkingSpot?.id ?? r.spotId ?? r.spot?.id ?? 0;

    const startISO = normalizeIsoLike(r.startTime ?? '');
    const endISO = normalizeIsoLike(r.endTime ?? '');
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
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [curRes, hisRes] = await Promise.all([
        fetch('/reservations/me/current', { credentials: 'include' }),
        fetch('/reservations/me/history', { credentials: 'include' }),
      ]);

      if (!curRes.ok && curRes.status !== 401) {
        const msg = await curRes.text().catch(() => '현재 예약 조회 실패');
        alert(msg);
        return;
      }
      if (!hisRes.ok && hisRes.status !== 401) {
        const msg = await hisRes.text().catch(() => '예약 이력 조회 실패');
        alert(msg);
        return;
      }

      const curJson: ReservationApi[] = curRes.ok ? await curRes.json() : [];
      const hisJson: ReservationApi[] = hisRes.ok ? await hisRes.json() : [];

      const curMapped = curJson.map(mapOne);
      const hisMapped = hisJson.map(mapOne);

      // ✅ "현재 예약 내역"은 기본적으로 /me/current(= RESERVED) 기반
      // 다만 혹시 백엔드가 상태를 RESERVED 대신 다른 값으로 내려주거나,
      // 시간이 겹치는 걸 현재로 보여주고 싶으면 inUseNow로 보강
      const computedCurrent = curMapped
        .filter(r => r.status !== 'CANCELED' && (r.status === 'RESERVED' || isInUseNow(r.startTime, r.endTime)))
        .sort((a, b) => toMillis(b.startTime) - toMillis(a.startTime));

      // ✅ fallback: /me/current가 비어 있으면 history에서 현재로 보일만한 것 끌어오기
      const fallbackFromHistory = hisMapped
        .filter(r => r.status !== 'CANCELED' && (r.status === 'RESERVED' || isInUseNow(r.startTime, r.endTime)))
        .sort((a, b) => toMillis(b.startTime) - toMillis(a.startTime));

      setCurrent(computedCurrent.length > 0 ? computedCurrent : fallbackFromHistory);

      // 과거 예약 이력(정렬)
      setHistory(hisMapped.sort((a, b) => toMillis(b.startTime) - toMillis(a.startTime)));
    } catch {
      alert('서버와 통신할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onCancel = async (reservationId: string) => {
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
      await loadAll();
    } catch {
      alert('서버와 통신할 수 없습니다.');
    }
  };

  const myCurrent = useMemo(() => current.filter(r => r.userId === userId), [current, userId]);
  const myHistory = useMemo(() => history.filter(r => r.userId === userId), [history, userId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
          <p className="text-gray-500 font-bold">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">예약 이력</h1>
        <p className="text-slate-400 mt-2 font-medium">현재 이용 중인 예약과 과거 이용 기록을 확인할 수 있습니다.</p>

        <div className="mt-5">
          <button
            onClick={loadAll}
            className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-100"
            title="새로고침"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* 현재 예약 내역 */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl font-black text-slate-800">현재 예약 내역</h2>
          <span className="text-xs font-bold text-slate-400">{myCurrent.length}건</span>
        </div>

        {myCurrent.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 font-bold">
            현재 예약 내역이 없습니다.
          </div>
        ) : (
          <div className="grid gap-4">
            {myCurrent.map(r => {
              const badge = badgeForCurrent(); // 현재 예약은 무조건 "이용중"으로 표시
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900">Spot #{r.slotId}</span>
                        <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-slate-500 font-bold">
                        차량번호: <span className="text-slate-800">{r.carNumber || '-'}</span>
                      </div>

                      <div className="mt-1 text-sm text-slate-500 font-bold">
                        {formatKoreanDateTime(r.startTime)} ~ {formatKoreanDateTime(r.endTime)}
                        {typeof r.durationHours === 'number' && r.durationHours > 0 && (
                          <span className="ml-2 text-slate-400">({r.durationHours}시간)</span>
                        )}
                      </div>
                    </div>

                    {/* ✅ 현재 예약 취소 버튼 */}
                    <button
                      onClick={() => onCancel(r.id)}
                      className="px-5 py-3 rounded-xl bg-red-50 text-red-600 font-black text-sm hover:bg-red-600 hover:text-white transition"
                    >
                      예약 취소
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 과거 예약 이력 */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl font-black text-slate-800">과거 예약 이력</h2>
          <span className="text-xs font-bold text-slate-400">{myHistory.length}건</span>
        </div>

        {myHistory.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 font-bold">
            과거 예약 이력이 없습니다.
          </div>
        ) : (
          <div className="grid gap-4">
            {myHistory.map(r => {
              const badge = badgeForHistory(r.status);
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900">Spot #{r.slotId}</span>
                        <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-slate-500 font-bold">
                        차량번호: <span className="text-slate-800">{r.carNumber || '-'}</span>
                      </div>

                      <div className="mt-1 text-sm text-slate-500 font-bold">
                        {formatKoreanDateTime(r.startTime)} ~ {formatKoreanDateTime(r.endTime)}
                        {typeof r.durationHours === 'number' && r.durationHours > 0 && (
                          <span className="ml-2 text-slate-400">({r.durationHours}시간)</span>
                        )}
                      </div>
                    </div>

                    {/* 과거 이력은 취소 버튼 없음 */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserHistory;
