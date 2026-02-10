import React, { useEffect, useMemo, useState } from 'react';


type AdminParkingStatusResponseDto = {
  userId: string;
  carNumber: string;
  parkingSpotNumber: number; // spotNumber (1~20)
  startTime: string; // ISO
  endTime: string;   // ISO
};

type AdminUserResponseDto = {
  userId: string;
  userName: string;
  age?: number | null;
  email?: string | null;
  phoneNumber?: string | null;

  // ✅ 현재 백엔드 DTO에는 role이 없음.
  // role까지 내려주면 USER만 필터 가능해짐.
  role?: 'USER' | 'ADMIN';
};

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

const TOTAL_SPOTS = 20;

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'users'>('blueprint');
  const [parkingStatus, setParkingStatus] = useState<AdminParkingStatusResponseDto[]>([]);
  const [users, setUsers] = useState<AdminUserResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, uRes] = await Promise.all([
        fetch('/admin/parking', { credentials: 'include' }),
        fetch('/admin/users', { credentials: 'include' }),
      ]);

      if (!pRes.ok) {
        const msg = await readErrorMessage(pRes, '주차장 현황 조회 실패');
        alert(msg);
        return;
      }
      if (!uRes.ok) {
        const msg = await readErrorMessage(uRes, '회원 목록 조회 실패');
        alert(msg);
        return;
      }

      const pJson: AdminParkingStatusResponseDto[] = await pRes.json();
      const uJson: AdminUserResponseDto[] = await uRes.json();

      setParkingStatus(Array.isArray(pJson) ? pJson : []);
      setUsers(Array.isArray(uJson) ? uJson : []);
    } catch {
      alert('서버와 통신할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ✅ spotNumber -> 예약정보 매핑
  const reservationBySpotNumber = useMemo(() => {
    const m = new Map<number, AdminParkingStatusResponseDto>();
    for (const r of parkingStatus) {
      if (typeof r.parkingSpotNumber === 'number') {
        m.set(r.parkingSpotNumber, r);
      }
    }
    return m;
  }, [parkingStatus]);

  // ✅ 화면에서 1~20 칸 고정 생성
  const spots = useMemo(() => {
    return Array.from({ length: TOTAL_SPOTS }, (_, i) => {
      const spotNumber = i + 1;
      const res = reservationBySpotNumber.get(spotNumber);
      return {
        spotNumber,
        label: `Spot #${spotNumber}`,
        isOccupied: Boolean(res),
        reservation: res,
      };
    });
  }, [reservationBySpotNumber]);

  // ✅ 회원관리에서 USER만 보여주고 싶다면 role이 필요함.
  // 현재 DTO에 role이 없으니, role이 내려오는 경우에만 필터하도록 처리.
  const managedUsers = useMemo(() => {
    const hasRole = users.some(u => u.role);
    if (!hasRole) return users; // role이 없으면 전체 표시(백엔드 수정 필요)
    return users.filter(u => u.role === 'USER');
  }, [users]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-10">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10">
          <p className="font-black text-slate-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-8 lg:p-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">관리자 대시보드</h1>
          <p className="text-slate-400 mt-2 font-medium">전체 주차장 작도 및 사용자 정보를 모니터링합니다.</p>

          {/* 새로고침 */}
          <div className="mt-4">
            <button
              onClick={loadAll}
              className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-100"
              title="새로고침"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${
              activeTab === 'blueprint' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'
            }`}
          >
            주차장 작도
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${
              activeTab === 'users' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'
            }`}
          >
            회원 관리
          </button>
        </div>
      </header>

      {activeTab === 'blueprint' ? (
        <div className="grid grid-cols-1 gap-8 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-50">
            <h3 className="text-xl font-black text-slate-900 mb-8 border-l-8 border-blue-600 pl-4">
              실시간 주차면 관리 작도
            </h3>

            <div className="bg-slate-50 rounded-[2rem] p-10 border-4 border-slate-200 flex flex-col gap-12 relative overflow-hidden">
              {/* Row A : 1~10 */}
              <div className="grid grid-cols-5 gap-6">
                {spots.slice(0, 10).map(slot => {
                  const res = slot.reservation;
                  return (
                    <div
                      key={slot.spotNumber}
                      className={`aspect-[3/4] rounded-xl border-2 flex flex-col p-3 transition-all relative ${
                        slot.isOccupied ? 'bg-white border-red-500' : 'bg-white border-green-200'
                      }`}
                    >
                      <span className="text-[9px] font-black text-slate-300">{slot.label}</span>

                      {res ? (
                        <div className="flex-grow flex flex-col justify-center text-center">
                          <p className="text-[11px] font-black text-red-600 bg-red-50 rounded py-1 mb-1">
                            {res.carNumber}
                          </p>
                          <p className="text-[10px] font-bold text-slate-700">{res.userId}</p>
                          <p className="mt-1 text-[9px] font-bold text-slate-400">
                            {formatKoreanDateTime(res.startTime)} ~ {formatKoreanDateTime(res.endTime)}
                          </p>
                        </div>
                      ) : (
                        <div className="flex-grow flex items-center justify-center opacity-10">
                          <i className="fas fa-parking text-3xl"></i>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Central Aisle */}
              <div className="h-20 bg-slate-200/50 rounded-2xl flex items-center justify-center border-y-4 border-dashed border-slate-300">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[2em] opacity-30 pl-8">
                  Safety Zone / Aisle
                </span>
              </div>

              {/* Row B : 11~20 */}
              <div className="grid grid-cols-5 gap-6">
                {spots.slice(10, 20).map(slot => {
                  const res = slot.reservation;
                  return (
                    <div
                      key={slot.spotNumber}
                      className={`aspect-[3/4] rounded-xl border-2 flex flex-col p-3 transition-all relative ${
                        slot.isOccupied ? 'bg-white border-red-500' : 'bg-white border-green-200'
                      }`}
                    >
                      {res ? (
                        <div className="flex-grow flex flex-col justify-center text-center">
                          <p className="text-[11px] font-black text-red-600 bg-red-50 rounded py-1 mb-1">
                            {res.carNumber}
                          </p>
                          <p className="text-[10px] font-bold text-slate-700">{res.userId}</p>
                          <p className="mt-1 text-[9px] font-bold text-slate-400">
                            {formatKoreanDateTime(res.startTime)} ~ {formatKoreanDateTime(res.endTime)}
                          </p>
                        </div>
                      ) : (
                        <div className="flex-grow flex items-center justify-center opacity-10">
                          <i className="fas fa-parking text-3xl"></i>
                        </div>
                      )}
                      <span className="text-[9px] font-black text-slate-300 text-right">{slot.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Technical Drawing Grid */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] grid grid-cols-20 grid-rows-20">
                {Array.from({ length: 400 }).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-slate-900"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
          {/* role이 없어서 USER만 필터 불가 안내(원하면 제거) */}
          {users.some(u => !u.role) && (
            <div className="px-10 py-4 bg-amber-50 text-amber-800 text-xs font-bold border-b border-amber-100">
              현재 AdminUserResponseDto에 role이 없어서 USER만 필터링할 수 없습니다. (DTO에 role 추가 또는 /admin/users/user-only API 추천)
            </div>
          )}

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
                {managedUsers.map(user => (
                  <tr key={user.userId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-6">
                      <p className="font-black text-slate-900">{user.userName}</p>
                      <p className="text-[10px] text-slate-400 font-medium">@{user.userId}</p>
                    </td>
                    <td className="px-10 py-6 text-sm font-bold text-slate-600">
                      {user.age != null ? `${user.age}세` : '-'}
                    </td>
                    <td className="px-10 py-6 text-sm font-bold text-slate-600">{user.phoneNumber || '-'}</td>
                    <td className="px-10 py-6 text-sm font-medium text-slate-500">{user.email || '-'}</td>
                    <td className="px-10 py-6">
                      <span
                        className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {user.role ?? 'UNKNOWN'}
                      </span>
                    </td>
                  </tr>
                ))}

                {managedUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-10 py-10 text-center text-slate-400 font-bold">
                      표시할 회원이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
