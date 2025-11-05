'use client';
import { useEffect, useState } from 'react';

export default function MonitorSinglePage() {
  const [calledList, setCalledList] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);
  const [waitingList, setWaitingList] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString('ja-JP', { hour12: false })
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch('/api/stream');
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      while (!cancelled) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const match = text.match(/data: (.+)/);
        if (match) {
          const payload = JSON.parse(match[1]);
          setCalledList(Array.isArray(payload.called) ? payload.called : []);
          setCurrent(payload.next || null);
          setWaitingList(Array.isArray(payload.waiting) ? payload.waiting : []);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('ja-JP', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="h-screen w-screen flex flex-col font-sans bg-teal-50 aspect-video">
      {/* 上部: メイン表示エリア */}
      <div className="flex flex-1 w-full items-stretch relative px-8 pb-4">
        {/* 左: 呼び出し済み番号（履歴） */}
  <aside className="w-[400px] bg-white border-r-2 border-teal-300 flex flex-col items-center justify-start rounded-2xl shadow-md py-8 mr-8">
          <div className="text-4xl text-teal-700 font-bold mb-6 tracking-wide">呼び出し済み</div>
          {calledList.length > 0 ? (
            <ul className="grid grid-cols-3 gap-2 items-center">
              {calledList.slice(0, 5).reverse().map((item, idx) => (
                <li key={item.id} className="w-28 h-16 flex items-center justify-center text-5xl font-extrabold text-white rounded-2xl shadow-md border border-teal-300"
                  style={{
                    minWidth: '7rem',
                    minHeight: '4rem',
                    background: `linear-gradient(135deg, #38b2ac 60%, #4299e1 100%)`,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                  }}>
                  {item.number}
                </li>
              ))}
            </ul>
          ) : (
            <div className="w-28 h-16 flex items-center justify-center text-5xl font-extrabold text-white rounded-2xl shadow-md border border-teal-300" style={{background: `linear-gradient(135deg, #38b2ac 60%, #4299e1 100%)`}}>-</div>
          )}
        </aside>
        {/* 中央: 直近1人の番号を最大表示 */}
        <section className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-md relative py-8">
          <div className="flex flex-col items-center justify-center relative w-full">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-5xl text-teal-700 font-bold whitespace-nowrap tracking-wide opacity-80">
              呼び出し中
            </div>
            <div className="text-[21vw] font-extrabold text-teal-500 leading-none tracking-widest drop-shadow-lg mt-8 mb-8">
              {calledList[0]?.number ?? '-'}
            </div>
          </div>
        </section>
      </div>
      {/* 下部: 待ち番号リストと現在時刻 */}
      <footer className="w-full min-h-[140px] bg-white border-t-2 border-teal-300 flex items-center px-8 py-6 rounded-b-2xl shadow-md relative">
  <span className="text-4xl text-teal-700 font-bold tracking-wide mr-8">次回</span>
        <ul className="flex gap-4 items-center">
          {waitingList.map((item) => (
            <li
              key={`waiting-${item.id}`}
              className="w-28 h-16 flex items-center justify-center text-5xl font-extrabold text-white rounded-2xl shadow-md border border-teal-300"
              style={{
                minWidth: '7rem',
                minHeight: '4rem',
                background: `linear-gradient(135deg, #38b2ac 60%, #4299e1 100%)`,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
              }}
            >
              {item.number}
            </li>
          ))}
        </ul>
  <div className="ml-auto text-4xl text-teal-700 font-bold flex items-center h-16">
          {currentTime}
        </div>
      </footer>
    </main>
  );
}
