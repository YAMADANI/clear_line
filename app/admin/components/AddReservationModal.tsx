"use client";
import { useState } from "react";


interface AddReservationModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (slot: string) => void;
  slots: { time: string; count: number }[];
}

export default function AddReservationModal({ open, onClose, onAdd, slots }: AddReservationModalProps) {
  const [slot, setSlot] = useState(slots[0]?.time || "");
  const [customSlot, setCustomSlot] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={e => { if (e.target === e.currentTarget) onClose(); }} />
      <div className="flex items-center justify-center min-h-screen pointer-events-none">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative pointer-events-auto z-10 mx-auto my-auto">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
          <h2 className="text-xl font-bold mb-4">予約追加</h2>
          <form onSubmit={e => {
            e.preventDefault();
            onAdd(useCustom ? customSlot : slot);
            setCustomSlot("");
            setUseCustom(false);
            onClose();
          }} className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">時間枠</label>
              <div className="flex gap-2 mb-2">
                <select
                  className="border rounded px-2 py-1 flex-1"
                  value={useCustom ? "custom" : slot}
                  onChange={e => {
                    if (e.target.value === "custom") {
                      setUseCustom(true);
                    } else {
                      setUseCustom(false);
                      setSlot(e.target.value);
                    }
                  }}
                >
                  {slots.map((s, i) => (
                    <option key={i} value={s.time}>{s.time}</option>
                  ))}
                  <option value="custom">カスタム</option>
                </select>
                {useCustom && (
                  <input
                    type="time"
                    className="border rounded px-2 py-1 w-28"
                    value={customSlot}
                    onChange={e => setCustomSlot(e.target.value)}
                    required
                  />
                )}
              </div>
            </div>
            <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded">追加</button>
          </form>
        </div>
      </div>
    </div>
  );
}
