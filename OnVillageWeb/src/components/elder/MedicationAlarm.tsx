// src/components/elder/MedicationAlarm.tsx
// import React from "react";

type Props = {
  open: boolean;
  timeText?: string;
  message?: string;
  onClose: () => void;
  onSnooze?: () => void;
};

export default function MedicationAlarm({ open, timeText, message, onClose, onSnooze }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10">
      {/* click-through background, but we don't block page interaction entirely */}
      <div className="pointer-events-none absolute inset-0 bg-transparent" />

      <div className="pointer-events-auto w-full max-w-[420px] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center gap-3 border-b border-black/5 px-5 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4A241]/15 text-[#F4A241]">
            {/* simple bell glyph */}
            <span aria-hidden>🔔</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-semibold text-[#2F3A2F]">복약 알림</p>
            {timeText && (
              <p className="truncate text-[13px] text-[#6B6B6B]">예정 시각: {timeText}</p>
            )}
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="whitespace-pre-line text-[16px] leading-relaxed text-[#3B3B3B]">
            {message ?? "지금은 약 드실 시간이에요. 물과 함께 복용해 주세요."}
          </p>
          <div className="mt-4 flex items-center justify-end gap-2">
            {onSnooze && (
              <button
                type="button"
                onClick={onSnooze}
                className="h-10 rounded-full border border-[#A6B5A6] bg-white px-4 text-[14px] font-semibold text-[#2F3A2F] hover:bg-[#F7F3E6]"
              >
                나중에
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-full bg-[#F4A241] px-5 text-[14px] font-semibold text-white shadow-sm hover:brightness-105"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

