// src/components/chat/Layout.tsx

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * GPT 스타일 레이아웃 (좌측 고정 사이드바 + 중앙 채팅 캔버스 + 하단 입력)
 * - 모바일: 햄버거로 사이드바 열기(오버레이)
 * - 헤더: 좌 로고/배지, 중앙 타이틀, 우 프로필
 */
export default function Layout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="min-h-dvh w-full bg-[#F7F3E6] text-[#2F3A2F]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#FFF6D6]">
        <div className="mx-auto grid h-14 max-w-screen-xl grid-cols-3 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" aria-label="사이드바 열기" onClick={() => setOpen(true)}>
              <div className="h-0.5 w-6 bg-[#2F3A2F]" />
              <div className="mt-1 h-0.5 w-6 bg-[#2F3A2F]" />
              <div className="mt-1 h-0.5 w-6 bg-[#2F3A2F]" />
            </button>
            <img src="/images/on_logo.svg" alt="ON마을" className="ml-2 h-7 w-auto lg:ml-0" />
            <span className="hidden rounded-full bg-[#6EA65E] px-2.5 py-0.5 text-xs font-semibold text-white sm:inline">공무원</span>
          </div>
          <h1 className="justify-self-center text-sm text-[#425a49]">{title}</h1>
          <div className="justify-self-end" ref={menuRef}>
            <button aria-label="프로필" className="grid h-9 w-9 place-content-center rounded-full bg-white shadow-sm">
              <img src="/images/icon_user.svg" alt="" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100dvh-56px)] max-w-screen-xl grid-cols-1 lg:grid-cols-[260px_1fr]">
        {/* 사이드바 */}
        <aside className="hidden border-r border-black/10 bg-[#FAFBFA] lg:block">
          <SidebarContent />
        </aside>

        {/* 모바일 드로어 */}
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[80%] max-w-[280px] border-r border-black/10 bg-[#FAFBFA] shadow-xl">
              <SidebarContent onItemClick={() => setOpen(false)} />
            </div>
          </div>
        )}

        {/* 중앙 캔버스 */}
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  return (
    <nav className="flex h-full flex-col px-3 py-4 text-sm">
      <Link to="/gov/chat" onClick={onItemClick} className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 shadow-sm">
        <img src="/images/icon_chat.svg" alt="" className="h-4 w-4" />
        숏폼 제작하기
      </Link>
      <Link to="#" onClick={onItemClick} className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-[#465a4a] hover:bg-black/5">
        <img src="/images/icon_list.svg" alt="" className="h-4 w-4" />
        제작물 리스트
      </Link>
      <div className="mt-auto">
        <hr className="my-3 border-black/10" />
        <button className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-[#7a8a7d] hover:bg-black/5">
          <img src="/images/icon_logout.svg" alt="" className="h-3.5 w-3.5" />
          로그아웃
        </button>
      </div>
    </nav>
  );
}