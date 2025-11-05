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
        const controller = new AbortController();
        const signal = controller.signal;
        let reader;
        try {
          const res2 = await fetch('/api/stream', { signal });
          if (!res2.body) throw new Error('stream fetch error');
          reader = res2.body.getReader();
          const decoder = new TextDecoder();
          const { value } = await reader.read();
          const text = decoder.decode(value);
          const match = text.match(/data: (.+)/);
          if (match) {
            const payload = JSON.parse(match[1]);
            setCalled(Array.isArray(payload.called) ? payload.called : payload.called ? [payload.called] : []);
          }
        } catch (e) {
          if ((e as Error).name !== 'AbortError') {
            console.error('Fetch error:', e);
          }
        } finally {
          if (reader) await reader.cancel();
        }
        return () => {
          controller.abort();
        };
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
    await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'called' })
    });
    setRefresh(r => r + 1);
  }

  // 呼び出し取消
  async function handleCallCancel(id: number) {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'waiting' })
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
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
          <circle cx="12" cy="12" r="3.5" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09c0 .66.39 1.25 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.66 0 1.25.39 1.51 1H21a2 2 0 1 1 0 4h-.09c-.66 0-1.25.39-1.51 1z" />
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
          <div className="flex flex-wrap gap-2">
            {called.length === 0 && <span className="text-gray-400 text-xl">なし</span>}
            {called.filter((c: any) => c.status !== 'done').map((c: any) => (
              <button
                key={c.id}
                className="w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg bg-teal-500 hover:bg-teal-600 text-white shadow border-2 border-teal-400 hover:scale-105 hover:ring-2 hover:ring-teal-300 transition-all duration-150 m-1"
                onClick={async () => {
                  await fetch(`/api/reservations/${c.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'done' })
                  });
                  setRefresh(r => r + 1);
                }}
                style={{ outline: 'none' }}
              >
                {c.number}
              </button>
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
