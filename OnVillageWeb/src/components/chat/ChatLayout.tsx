// src/components/chat/Layout.tsx

import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import { useState } from "react";

export default function ChatLayout() {
  const [messages, setMessages] = useState([
    { sender: "gov", message: "시나리오가 완성됐습니다!\n전체 흐름은 이렇게 구성되었어요:" },
    { sender: "user", message: "좋아 이렇게 숏폼 제작해줘" },
  ]);

  const handleSend = (msg: string) => {
    setMessages((prev) => [...prev, { sender: "user", message: msg }]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#fafafa]">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <h1 className="text-lg font-semibold text-green-700">ON마을 공무원</h1>
      </header>

      {/* 채팅 영역 */}


      {/* 입력창 */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}