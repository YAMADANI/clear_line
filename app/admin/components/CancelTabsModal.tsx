import * as Tabs from '@radix-ui/react-tabs';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { useState } from 'react';

interface CancelTabsModalProps {
  open: boolean;
  onClose: () => void;
  called: { id: number; number: number }[];
  onCancel: (id: number) => void;
  onFix: (number: number, status: 'waiting' | 'called') => void;
}

export default function CancelTabsModal({ open, onClose, called, onCancel, onFix }: CancelTabsModalProps) {
  const [tab, setTab] = useState('cancel');
  // FixDone用
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'waiting' | 'called'>('called');

  const handleKey = (val: string) => {
    if (val === 'del') setInput(input.slice(0, -1));
    else if (val === 'clear') setInput('');
    else if (/^\d$/.test(val) && input.length < 4) setInput(input + val);
  };
  const handleFix = () => {
    if (input) {
      onFix(Number(input), status);
      setInput('');
      setStatus('called');
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[340px] flex flex-col items-center">
        <Tabs.Root value={tab} onValueChange={setTab} className="w-full">
          <Tabs.List className="flex gap-4 mb-6">
            <Tabs.Trigger value="cancel" className={tab==="cancel"?"border-b-2 border-teal-500 text-teal-600 font-bold px-4 py-2":"text-gray-500 px-4 py-2"}>呼び出し済みの取り消し</Tabs.Trigger>
            <Tabs.Trigger value="fix" className={tab==="fix"?"border-b-2 border-teal-500 text-teal-600 font-bold px-4 py-2":"text-gray-500 px-4 py-2"}>完了の取り消し</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="cancel">
            <div className="text-xl font-bold text-gray-700 mb-4">対象を選択</div>
            <div className="flex flex-wrap gap-3 mb-6 max-w-xs justify-center">
              {called.length === 0 && <span className="text-gray-400 text-xl">呼び出し済みなし</span>}
              {called.map(c => (
                <button
                  key={c.id}
                  className="w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg bg-teal-500 hover:bg-yellow-500 text-white shadow border-2 border-teal-400 hover:scale-105 hover:ring-2 hover:ring-yellow-300 transition-all duration-150"
                  onClick={() => onCancel(c.id)}
                >
                  {c.number}
                </button>
              ))}
            </div>
          </Tabs.Content>
          <Tabs.Content value="fix">
            <div className="text-xl font-bold text-gray-700 mb-4">対象を選択</div>
            <div className="mb-4">
              <input
                className="w-32 text-3xl text-center border-b-2 border-teal-400 outline-none mb-2"
                value={input}
                readOnly
                placeholder="番号"
              />
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <button key={n} className="bg-gray-200 hover:bg-teal-400 text-2xl rounded p-2" onClick={() => handleKey(String(n))}>{n}</button>
                ))}
                <button className="bg-gray-200 hover:bg-yellow-400 text-xl rounded p-2" onClick={() => handleKey('del')}>⌫</button>
                <button className="bg-gray-200 hover:bg-teal-400 text-2xl rounded p-2" onClick={() => handleKey('0')}>0</button>
                <button className="bg-gray-200 hover:bg-red-400 text-xl rounded p-2" onClick={() => handleKey('clear')}>C</button>
              </div>
            </div>
            <RadioGroup.Root
              className="flex gap-6 mb-6"
              value={status}
              onValueChange={v => setStatus(v as 'waiting' | 'called')}
            >
              <div className="flex items-center gap-2">
                <RadioGroup.Item value="called" id="fix-called" className="w-5 h-5 rounded-full border border-teal-500 flex items-center justify-center">
                  <RadioGroup.Indicator className="w-3 h-3 bg-teal-500 rounded-full" />
                </RadioGroup.Item>
                <label htmlFor="fix-called" className="text-lg">呼び出し済みに戻す</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroup.Item value="waiting" id="fix-waiting" className="w-5 h-5 rounded-full border border-teal-500 flex items-center justify-center">
                  <RadioGroup.Indicator className="w-3 h-3 bg-teal-500 rounded-full" />
                </RadioGroup.Item>
                <label htmlFor="fix-waiting" className="text-lg">待ちに戻す</label>
              </div>
            </RadioGroup.Root>
            <div className="flex gap-4">
              <button
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded font-bold text-lg"
                onClick={handleFix}
                disabled={!input}
              >
                修正
              </button>
            </div>
          </Tabs.Content>
        </Tabs.Root>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded font-bold mt-6"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
