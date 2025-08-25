// src/pages/Gov/Chat.tsx

import { useEffect, useRef, useState } from "react";
import HeaderGov from "../../components/layout/HeaderGov";
import Sidebar from "../../components/layout/Sidebar";
import MobileDrawer from "../../components/layout/MobileDrawer";
import ChatBubble from "../../components/chat/ChatBubble";
import ChatInput from "../../components/chat/ChatInput";

type Msg = {
  id: string;
  side: "left" | "right";
  tone?: "white" | "green";
  text: string;
};

export default function Chat() {
  const [drawer, setDrawer] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "m1", side: "left", text: "안녕하세요!\n지역축제 영상 제작을 원하시나요?" },
    { id: "m2", side: "right", tone: "green", text: "진도 전통 문화 축제 숏폼 제작해줘" },
  ]);

  // 채팅 자동 스크롤
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const onSend = (text: string) => {
    setMsgs(prev => [
      ...prev,
      { id: crypto.randomUUID(), side: "right", tone: "green", text },
    ]);
    // TODO: 서버 연결 후 응답 push
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAF7ED]">
      {/* 상단 헤더 */}
      <HeaderGov onOpenMenu={() => setDrawer(true)} />

      {/* 본문 2열 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측: 사이드바 (별도 스크롤) */}
        <aside className="hidden md:block w-[240px] border-r border-[#E9E6D9] bg-[#FFFDF5] overflow-y-auto">
          <Sidebar current="chat" />
        </aside>

        {/* 우측: 채팅 화면 */}
        <section className="flex-1 flex flex-col overflow-hidden">
          {/* 채팅 내용 */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 py-6"
          >
            <div className="mx-auto w-full max-w-[900px]">
              {msgs.map(m => (
                <ChatBubble key={m.id} side={m.side}>
                  <p className="whitespace-pre-line text-[15px] leading-7">{m.text}</p>
                </ChatBubble>
              ))}
            </div>
          </div>

          {/* 입력창: 하단 고정 */}
          <div className="sticky bottom-0 z-10 border-t border-[#E9E6D9] bg-white">
            <div className="mx-auto w-full max-w-[900px] px-4 md:px-0 py-4">
              <ChatInput onSend={onSend} />
            </div>
            {/* 모바일 안전영역 보정 */}
            <div className="pb-[env(safe-area-inset-bottom)]" />
          </div>
        </section>
      </div>

      {/* 모바일 드로어 */}
      <MobileDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        onClickMenu={(k) => console.log("go", k)}
      />
    </div>
  );
}