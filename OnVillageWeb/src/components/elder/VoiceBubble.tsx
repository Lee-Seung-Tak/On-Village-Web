// VoiceBubble.tsx

import React from "react";

type Props = {
  role: "agent" | "user";
  children: React.ReactNode;
  className?: string;
};

const GREEN = "#67A462";
const ORANGE = "#F6A34D";

export default function VoiceBubble({ role, children, className }: Props) {
  const isAgent = role === "agent";

  return (
    <div className={`w-full flex justify-center my-3 ${className || ""}`}>
      {/* ✅ 최소 가로폭 보장 */}
      <div className="relative w-[92%] max-w-[680px] min-w-[170px] overflow-visible" aria-live="polite">
        {/* ✅ 최소 세로높이 보장 */}
        <div
          className={`relative px-6 md:px-7 py-5 md:py-6 rounded-3xl shadow-[0_2px_0_rgba(0,0,0,0.03)]
            bg-white text-[#383838] font-semibold leading-[1.5] text-[25px] md:text-[26px] border-2
            min-h-[170px] md:min-h-[190px]
            ${isAgent ? "border-[#67A462]" : "border-[#F6A34D]"}`}
        >
          {children}
          {/* ❗️SVG 꼬리 — 해상도/배율에 상관없이 깔끔 */}
          {isAgent ? (
            // 위-왼쪽으로 붙는 꼬리
            <svg
              className="absolute -top-[18px] left-12"
              width="36" height="24" viewBox="0 0 36 24" aria-hidden
            >
              {/* 바깥(테두리색) */}
              <path d="M0,24 L36,24 L14,2 Z" fill={GREEN} />
              {/* 안쪽(버블 배경색) — 테두리 두께만큼 안쪽으로 오프셋 */}
              <path d="M2,24 L34,24 L14,4 Z" fill="#FFFFFF" />
            </svg>
          ) : (
            // 아래-오른쪽으로 붙는 꼬리
            <svg
              className="absolute -bottom-[18px] right-14"
              width="36" height="24" viewBox="0 0 36 24" aria-hidden
            >
              {/* 바깥(테두리색) */}
              <path d="M36,0 L0,0 L22,22 Z" fill={ORANGE} />
              {/* 안쪽(버블 배경색) */}
              <path d="M34,0 L2,0 L22,20 Z" fill="#FFFFFF" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}