// src/pages/UserHistory.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Reservation, ReservationStatus } from '../types';

interface UserHistoryProps {
  userId: string; // 화면 표시용 (서버는 세션으로 유저 식별)
}

// ✅ 이제 백엔드가 ReservationResponseDto로 내려줌
type ReservationApi = {
  id: number | string;
  carNumber?: string;
  startTime?: string;
  endTime?: string;
  status?: string;

  parkingSpotId?: number;
  spotNumber?: number;
  parkingLotId?: number;
  parkingLotName?: string;
};

function normalizeStatus(s?: string): ReservationStatus {
  if (s === 'RESERVED' || s === 'CANCELED' || s === 'COMPLETED') return s;
  return 'RESERVED';
}

function normalizeIsoLike(dt?: string) {
  if (!dt) return '';
  if (dt.includes('T')) return dt;
  if (dt.includes(' ')) return dt.replace(' ', 'T');
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

function isInUseNow(startISO?: string, endISO?: string) {
  const s = toMillis(startISO);
  const e = toMillis(endISO);
  const now = Date.now();
  if (Number.isNaN(s) || Number.isNaN(e)) return false;
  return s <= now && now <= e;
}

function badgeForCurrentByTime(startISO?: string, endISO?: string) {
  if (isInUseNow(startISO, endISO)) {
    return { label: '이용중', cls: 'bg-green-50 text-green-700 border-green-100' };
  }
  return { label: '예약중', cls: 'bg-blue-50 text-blue-700 border-blue-100' };
}

function badgeForHistory(status: ReservationStatus) {
  switch (status) {
    case 'CANCELED':
      return { label: '취소됨', cls: 'bg-red-50 text-red-700 border-red-100' };
    case 'RESERVED':
      return { label: '예약중', cls: 'bg-blue-50 text-blue-700 border-blue-100' };
    case 'COMPLETED':
    default:
      return { label: '이용완료', cls: 'bg-slate-50 text-slate-700 border-slate-100' };
  }
}

async function readErrorMessage(res: Response, fallback: string) {
  const ct = res.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      const j = await res.json();
      return j.message || j.error || fallback;
    }
    const t = await res.text();
    return t || fallback;
  } catch {
    return fallback;
  }
}

const UserHistory: React.FC<UserHistoryProps> = ({ userId }) => {
  const [current, setCurrent] = useState<Reservation[]>([]);
  const [history, setHistory] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const mapOne = (r: ReservationApi): Reservation => {
    // ✅ Spot 번호는 DTO의 spotNumber로 표시
    const slotId = r.spotNumber ?? 0;

    const startISO = normalizeIsoLike(r.startTime ?? '');
    const endISO = normalizeIsoLike(r.endTime ?? '');
    const status = normalizeStatus(r.status);

    return {
      id: String(r.id),
      userId, // props 유지
      userName: '',
      slotId,
      carNumber: r.carNumber ?? '',
      startTime: startISO,
      endTime: endISO,
      status,
      durationHours: calcDurationHours(startISO, endISO),
    };
  };

  // key 중복 방지
  const reactKey = (r: Reservation, idx: number) => `${r.id}-${r.slotId}-${r.startTime}-${idx}`;

  const loadAll = async () => {
    setLoading(true);
    try {
      const [curRes, hisRes] = await Promise.all([
        fetch('/reservations/me/current', { credentials: 'include' }),
        fetch('/reservations/me/history', { credentials: 'include' }),
      ]);

      if (!curRes.ok && curRes.status !== 401) {
        alert(await readErrorMessage(curRes, '현재 예약 조회 실패'));
        return;
      }
      if (!hisRes.ok && hisRes.status !== 401) {
        alert(await readErrorMessage(hisRes, '예약 이력 조회 실패'));
        return;
      }

      const curJson: ReservationApi[] = curRes.ok ? await curRes.json() : [];
      const hisJson: ReservationApi[] = hisRes.ok ? await hisRes.json() : [];

      const curMapped = curJson.map(mapOne);
      const hisMapped = hisJson.map(mapOne);

      // 현재 예약: RESERVED 또는 시간상 이용중
      const currentAll = curMapped
        .filter(r => r.status !== 'CANCELED' && (r.status === 'RESERVED' || isInUseNow(r.startTime, r.endTime)))
        .sort((a, b) => toMillis(b.startTime) - toMillis(a.startTime));

      // 과거 예약: current id 제외
      const currentIds = new Set(currentAll.map(r => r.id));
      const historyOnly = hisMapped
        .filter(r => !currentIds.has(r.id))
        .sort((a, b) => toMillis(b.startTime) - toMillis(a.startTime));

      setCurrent(currentAll);
      setHistory(historyOnly);
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
      const res = await fetch(`/reservations/${encodeURIComponent(reservationId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        alert(await readErrorMessage(res, '예약 취소 실패'));
        return;
      }

      alert('예약이 정상적으로 취소되었습니다.');
      await loadAll();
    } catch {
      alert('서버와 통신할 수 없습니다.');
    }
  };

  // /me/* 는 세션 유저 기준이라 필터링 불필요
  const myCurrent = useMemo(() => current, [current]);
  const myHistory = useMemo(() => history, [history]);

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
            {myCurrent.map((r, idx) => {
              const badge = badgeForCurrentByTime(r.startTime, r.endTime);
              return (
                <div key={reactKey(r, idx)} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
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
            {myHistory.map((r, idx) => {
              const badge = badgeForHistory(r.status);
              return (
                <div key={reactKey(r, idx)} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
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
