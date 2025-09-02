// src/components/layout/HeaderGov.tsx

import { useState } from "react";

type Props = { onOpenMenu: () => void; userName?: string };

export default function HeaderGov({ onOpenMenu, userName = "000님" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-14 md:h-16 w-full border-b border-[#E9E6D9] bg-[#FFFDF5]">
      <div className="mx-auto max-w-[1200px] h-full flex items-center justify-between px-4 md:px-6">
        {/* 왼쪽: 햄버거(모바일) + 로고 + '공무원' 배지 */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden -ml-1 p-2 rounded-md"
            aria-label="메뉴 열기"
            onClick={onOpenMenu}
          >
            <div className="w-6 h-[2px] bg-[#3C8C4E] mb-1.5" />
            <div className="w-6 h-[2px] bg-[#3C8C4E] mb-1.5" />
            <div className="w-6 h-[2px] bg-[#3C8C4E]" />
          </button>

          <div className="flex items-center gap-2">
            <img src="/images/gov_logo.svg" alt="ON마을공무원" className="h-6 md:h-7" />
          </div>
        </div>

        {/* 가운데: 페이지 타이틀(PC) */}
        {/* <h1 className="hidden md:block text-[#3C3C3C] text-[15px]">숏폼 제작하기</h1> */}

        {/* 오른쪽: 프로필 드롭다운 */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-[#E0E0E0] bg-[#568D5A]"
            aria-label="프로필"
          >
            <img src="/images/icon_user.svg" className="w-4 h-4" />
          </button>

          {open && (
            <div
              onMouseLeave={() => setOpen(false)}
              className="absolute right-0 mt-2 w-40 rounded-lg border border-[#E9E6D9] bg-white shadow-sm z-10"
            >
              <div className="px-4 py-3 text-sm text-[#4A4A4A]">{userName}</div>
              <button
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left hover:bg-[#FAF7ED]"
                onClick={() => {
                  // TODO: 로그아웃 처리
                }}
              >
                <img src="/images/icon_logout.svg" className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}