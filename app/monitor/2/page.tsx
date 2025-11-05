// /monitor/2/page.tsx
// サービスエリア表示（青緑モダンUI・9:16比率）
'use client';
import { useEffect, useState } from 'react';

export default function MonitorAreaPage() {
  const [waiting, setWaiting] = useState([]);
  const [called, setCalled] = useState(null);

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
          setWaiting(Array.isArray(payload.waiting) ? payload.waiting : []);
          setCalled(payload.called && typeof payload.called === 'object' ? payload.called : null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100vw',
        aspectRatio: '16/9',
        background: 'linear-gradient(135deg, #38b2ac 0%, #4299e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Segoe UI", "Noto Sans JP", sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: 700,
          minHeight: 600,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 32,
          boxShadow: '0 8px 32px 0 rgba(56,178,172,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* 待ち番号リスト */}
        <section
          style={{
            flex: 1,
            background: 'linear-gradient(120deg, #e6fffa 0%, #bee3f8 100%)',
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h2 style={{ fontSize: 32, color: '#319795', fontWeight: 700, marginBottom: 24 }}>待ち番号</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {waiting.map((w: any) => (
              <li key={w.id} style={{ fontSize: 56, fontWeight: 700, color: '#319795', margin: '18px 0', letterSpacing: 2 }}>{w.number}</li>
            ))}
          </ul>
        </section>
        {/* 呼び出し番号 */}
        <section
          style={{
            flex: 1,
            background: 'linear-gradient(120deg, #ebf8ff 0%, #b2f5ea 100%)',
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeft: '2px solid #81e6d9',
          }}
        >
          <h2 style={{ fontSize: 32, color: '#4299e1', fontWeight: 700, marginBottom: 24 }}>呼び出し中</h2>
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: '#4299e1',
              background: 'linear-gradient(90deg, #38b2ac 60%, #4299e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1,
              textShadow: '0 4px 24px #4299e155',
            }}
          >
            {called && typeof called === 'object' && 'number' in called ? (called as any).number : '-'}
          </div>
        </section>
      </div>
    </main>
  );
}
