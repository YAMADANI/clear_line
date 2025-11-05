"use client";
import { useState, useEffect } from "react";
import SettingsModal from "./components/SettingsModal";
import AddReservationModal from "./components/AddReservationModal";
export default function AdminPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [called, setCalled] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  // 予約枠（SettingsModalとAddReservationModalで共有）
  const [slots, setSlots] = useState<{ time: string; count: number }[]>([
    { time: '09:00', count: 2 },
    { time: '10:00', count: 3 },
  ]);

  // 待ち番号リスト取得（管理画面はGET APIで定期取得）
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        // 待ち番号
        const res = await fetch('/api/reservations/get/');
        if (!cancelled) setReservations(await res.json());
        // 呼び出し済み番号
        const res2 = await fetch('/api/stream');
        if (!res2.body) throw new Error('stream fetch error');
        const reader = res2.body.getReader();
        const decoder = new TextDecoder();
        const { value } = await reader.read();
        const text = decoder.decode(value);
        const match = text.match(/data: (.+)/);
        if (match) {
          const payload = JSON.parse(match[1]);
          setCalled(Array.isArray(payload.called) ? payload.called : payload.called ? [payload.called] : []);
        }
      } catch (e) {
        if (!cancelled) alert('データ取得に失敗しました');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refresh]);

  // 予約追加
  async function handleAddReservation(slot: string) {
    setLoading(true);
    await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot })
    });
    setLoading(false);
    setRefresh(r => r + 1);
  }

  // 次に呼ぶ
  async function handleCall(id: number) {
    await fetch('/api/reservations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    setRefresh(r => r + 1);
  }

  // 呼び出し取消
  async function handleCallCancel(id: number) {
    const res = await fetch('/api/reservations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'waiting' })
    });
    if (!res.ok) {
      alert('呼び出し取消に失敗しました');
      return;
    }
    setRefresh(r => r + 1);
  }

  // 削除
  async function handleDelete(id: number) {
    await fetch(`/api/reservations/${id}`, {
      method: 'DELETE',
    });
    setRefresh(r => r + 1);
  }

  return (
    <main className="w-screen h-screen p-6 bg-white flex flex-col relative">
      {/* 歯車アイコン 右上固定 */}
      <button
        className="absolute top-4 right-4 z-50 bg-white rounded-full shadow p-2 hover:bg-gray-100"
        onClick={() => setSettingsOpen(true)}
        aria-label="設定"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-500">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 2.25c.38-1.14 2.12-1.14 2.5 0l.19.57a1.5 1.5 0 0 0 2.1.87l.54-.31c1.06-.6 2.3.64 1.7 1.7l-.31.54a1.5 1.5 0 0 0 .87 2.1l.57.19c1.14.38 1.14 2.12 0 2.5l-.57.19a1.5 1.5 0 0 0-.87 2.1l.31.54c.6 1.06-.64 2.3-1.7 1.7l-.54-.31a1.5 1.5 0 0 0-2.1.87l-.19.57c-.38 1.14-2.12 1.14-2.5 0l-.19-.57a1.5 1.5 0 0 0-2.1-.87l-.54.31c-1.06.6-2.3-.64-1.7-1.7l.31-.54a1.5 1.5 0 0 0-.87-2.1l-.57-.19c-1.14-.38-1.14-2.12 0-2.5l.57-.19a1.5 1.5 0 0 0 .87-2.1l-.31-.54c-.6-1.06.64-2.3 1.7-1.7l.54.31a1.5 1.5 0 0 0 2.1-.87l.19-.57z" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
        </svg>
      </button>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <div className="flex-1 flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-gray-100 rounded p-8 flex flex-col items-center">
          <div className="text-lg text-gray-500 mb-2">次に呼ぶ番号</div>
          <div className="text-6xl font-bold text-blue-700 mb-4">
            {reservations.length > 0 && reservations[0] && reservations[0].number ? reservations[0].number : '-'}
          </div>
          <div className="text-lg text-gray-400 mb-4">待ち人数: {reservations.length}</div>
          {reservations.length > 0 && (
            <button
              onClick={() => handleCall(reservations[0].id)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-xl mt-2 shadow"
            >
              呼び出し
            </button>
          )}
        </div>
        <div className="flex-1 bg-gray-100 rounded p-8">
          <div className="text-lg text-gray-500 mb-4">呼び出し済み番号</div>
          <div className="flex flex-wrap gap-4">
            {called.length === 0 && <span className="text-gray-400 text-xl">なし</span>}
            {called.map((c: any) => (
              <div key={c.id} className="flex flex-col items-center">
                <span
                      className="w-16 h-16 flex items-center justify-center text-3xl font-bold rounded bg-linear-to-br from-gray-400 to-gray-200 text-white mb-2"
                    >
                  {c.number}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCallCancel(c.id)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded text-base font-bold shadow"
                  >取消</button>
                  <button
                    onClick={async () => {
                      await fetch(`/api/reservations/${c.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'done' })
                      });
                      setRefresh(r => r + 1);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-base font-bold shadow"
                  >完了</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 予約追加ボタンを中央に配置 */}
      <div className="flex justify-center my-8">
        <button
          className="bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow px-8 py-4 font-bold text-xl"
          onClick={() => setAddOpen(true)}
        >
          予約追加
        </button>
      </div>
      <AddReservationModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAddReservation}
        slots={slots}
      />

      <h2 className="text-2xl font-semibold mb-6 text-teal-600">待ち番号リスト</h2>
      <div className="flex flex-wrap gap-4">
        {reservations.length === 0 && (
          <span className="text-gray-400 text-xl">待ち番号なし</span>
        )}
        {reservations.map((r: any) => (
          <div key={r.id} className="flex flex-col items-center bg-gray-50 rounded shadow p-3 min-w-22">
            <span className="w-14 h-14 flex items-center justify-center text-2xl font-bold rounded bg-linear-to-br from-teal-400 to-blue-400 text-white mb-2">{r.number}</span>
            <div className="flex gap-2">
              <button onClick={() => handleCall(r.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded font-bold text-base shadow">呼び出し</button>
              <button onClick={() => handleDelete(r.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded font-bold text-base shadow">削除</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
