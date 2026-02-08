import React, { useEffect, useMemo, useState } from 'react';
import { Reservation } from '../types';

interface UserHistoryProps {
  userId: string;
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

function calcDurationHours(startISO?: string, endISO?: string) {
  if (!startISO || !endISO) return 0;
  const diff = new Date(endISO).getTime() - new Date(startISO).getTime();
  if (Number.isNaN(diff) || diff <= 0) return 0;
  return Math.round(diff / (1000 * 60 * 60));
}

const UserHistory: React.FC<UserHistoryProps> = ({ userId }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/reservations/me/history', { credentials: 'include' });
      if (!res.ok) {
        const msg = await res.text().catch(() => '예약 이력 조회 실패');
        alert(msg);
        return;
      }

      const json: ReservationApi[] = await res.json();
      const mapped: Reservation[] = json.map(r => {
        const slotId =
          r.parkingSpotId ??
          r.parkingSpot?.id ??
          r.spotId ??
          r.spot?.id ??
          0;

        const startISO = r.startTime ?? '';
        const endISO = r.endTime ?? '';

        return {
          id: String(r.id),
          userId,
          userName: '',
          slotId,
          carNumber: r.carNumber ?? '',
          startTime: startISO,
          endTime: endISO,
          status: (r.status as any) ?? 'COMPLETED',
          durationHours: calcDurationHours(startISO, endISO),
        };
      });

      setReservations(mapped.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
    } catch {
      alert('서버와 통신할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
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
      await loadHistory();
    } catch {
      alert('서버와 통신할 수 없습니다.');
    }
  };

  const myReservations = useMemo(() => [...reservations].filter(r => r.userId === userId), [reservations, userId]);

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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fadeIn">
      {/* UI는 네 기존 코드 그대로, onCancel만 연결 */}
      {/* ... */}
      {/* 예약 취소 버튼 */}
      {/* {res.status === 'ACTIVE' && <button onClick={() => onCancel(res.id)} ... />} */}
      {/* ... */}
    </div>
  );
};

export default UserHistory;
