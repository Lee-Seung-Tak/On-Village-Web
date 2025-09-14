// src/components/common/Toast.tsx
import React, { useEffect } from "react";

type Props = {
  open: boolean;
  message: string;
  onClose: () => void;
  durationMs?: number;
};

export default function Toast({ open, message, onClose, durationMs = 3000 }: Props) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(id);
  }, [open, onClose, durationMs]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-end justify-center pb-8">
      <div className="pointer-events-auto max-w-[86%] md:max-w-[420px] rounded-full bg-[#333] text-white text-[14px] md:text-[15px] font-medium px-4 py-3 shadow-lg">
        {message}
      </div>
    </div>
  );
}

