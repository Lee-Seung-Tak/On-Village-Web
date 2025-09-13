// src/components/elder/ConsentModal.tsx
// import React from "react";

type Props = {
  open: boolean;
  onAgree: () => void;
  onDisagree: () => void;
};

export default function ConsentModal({ open, onAgree, onDisagree }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-center text-[20px] font-bold text-[#2F3A2F]">
          이야기 공유 선택 동의
        </h2>
        <p className="mt-4 whitespace-pre-line text-center text-[18px] leading-relaxed text-[#3B3B3B]">
          {`오늘 나눈 이야기는 마을의 추억 앨범에 담깁니다.
원하실 경우 짧게 편집해 다른 분과 나눌 수도 있습니다.
(이름은 가명, 목소리는 변조됩니다.)`}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onDisagree}
            className="h-12 min-w-[120px] rounded-full border border-[#A6B5A6] bg-white px-6 text-[16px] font-semibold text-[#2F3A2F] transition hover:bg-[#F7F3E6] active:scale-[0.99]"
          >
            비동의
          </button>
          <button
            type="button"
            onClick={onAgree}
            className="h-12 min-w-[120px] rounded-full bg-[#F4A241] px-6 text-[16px] font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.99]"
          >
            동의
          </button>
        </div>
      </div>
    </div>
  );
}

