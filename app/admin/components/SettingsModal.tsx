"use client";
import { useState } from "react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [tab, setTab] = useState<'slot' | 'theme' | 'ui'>('slot');
  const [slots, setSlots] = useState<{ time: string; count: number }[]>([
    { time: '09:00', count: 2 },
    { time: '10:00', count: 3 },
  ]);
  const [slotTime, setSlotTime] = useState('');
  const [slotCount, setSlotCount] = useState(1);
  const [theme, setTheme] = useState('teal');
  const [uiType, setUiType] = useState<'area' | 'single'>('area');

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      {/* 背景クリック判定はflex外で */}
      <div className="absolute inset-0 bg-black/40" onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }} />
      <div className="flex items-center justify-center min-h-screen pointer-events-none">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative pointer-events-auto z-10 mx-auto my-auto">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
          <h2 className="text-xl font-bold mb-4">設定</h2>
          <div className="flex border-b mb-4">
            <button className={`flex-1 py-2 font-semibold ${tab === 'slot' ? 'border-b-2 border-teal-500 text-teal-700' : 'text-gray-500'}`} onClick={() => setTab('slot')}>予約枠</button>
            <button className={`flex-1 py-2 font-semibold ${tab === 'theme' ? 'border-b-2 border-teal-500 text-teal-700' : 'text-gray-500'}`} onClick={() => setTab('theme')}>テーマ</button>
            <button className={`flex-1 py-2 font-semibold ${tab === 'ui' ? 'border-b-2 border-teal-500 text-teal-700' : 'text-gray-500'}`} onClick={() => setTab('ui')}>UI切替</button>
          </div>
          <div className="space-y-6">
            {tab === 'slot' && (
              <section>
                <h3 className="font-semibold mb-2">予約枠の調整</h3>
                <div className="flex gap-2 mb-2">
                  <input type="time" className="border rounded px-2 py-1" value={slotTime} onChange={e => setSlotTime(e.target.value)} />
                  <input type="number" min={1} className="border rounded px-2 py-1 w-20" placeholder="人数" value={slotCount} onChange={e => setSlotCount(Number(e.target.value))} />
                  <button className="bg-teal-500 text-white px-3 py-1 rounded" onClick={() => {
                    if (slotTime && slotCount > 0) {
                      setSlots([...slots, { time: slotTime, count: slotCount }]);
                      setSlotTime('');
                      setSlotCount(1);
                    }
                  }}>追加</button>
                </div>
                <ul className="text-sm text-gray-600">
                  {slots.map((s, i) => (
                    <li key={i}>{s.time} - {s.count}人</li>
                  ))}
                </ul>
              </section>
            )}
            {tab === 'theme' && (
              <section>
                <h3 className="font-semibold mb-2">UIテーマ</h3>
                <div className="flex gap-2">
                  <button className={`w-8 h-8 rounded border-2 ${theme === 'teal' ? 'border-teal-700' : 'border-transparent'} bg-teal-400`} onClick={() => setTheme('teal')}></button>
                  <button className={`w-8 h-8 rounded border-2 ${theme === 'blue' ? 'border-blue-700' : 'border-transparent'} bg-blue-400`} onClick={() => setTheme('blue')}></button>
                  <button className={`w-8 h-8 rounded border-2 ${theme === 'pink' ? 'border-pink-700' : 'border-transparent'} bg-pink-400`} onClick={() => setTheme('pink')}></button>
                </div>
                <div className="mt-2 text-sm text-gray-500">※テーマ変更はデモ用（実際のUIには未反映）</div>
              </section>
            )}
            {tab === 'ui' && (
              <section>
                <h3 className="font-semibold mb-2">Monitor用UI切替</h3>
                <div className="flex gap-2">
                  <button className={`px-3 py-1 rounded border font-semibold ${uiType === 'area' ? 'border-teal-500 text-teal-700' : 'border-gray-300 text-gray-500'}`} onClick={() => setUiType('area')}>サービスエリア</button>
                  <button className={`px-3 py-1 rounded border font-semibold ${uiType === 'single' ? 'border-blue-500 text-blue-700' : 'border-gray-300 text-gray-500'}`} onClick={() => setUiType('single')}>直近1人</button>
                </div>
                <div className="mt-2 text-sm text-gray-500">※UI切替はデモ用（実際のMonitor画面には未反映）</div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
