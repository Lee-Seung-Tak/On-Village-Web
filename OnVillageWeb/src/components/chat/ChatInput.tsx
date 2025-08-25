// src/components/chat/ChatInput.tsx

import { useState } from "react";

export default function ChatInput({
  onSend,
}: {
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");

  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div className="w-full border-t border-[#E9E6D9] bg-white">
      <div className="mx-auto max-w-[900px] px-4 md:px-0 py-4">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="제작하고 싶은 홍보물 내용을 입력하세요"
            className="flex-1 h-12 rounded-full border border-[#E0E0E0] bg-white px-5 text-[15px] placeholder:text-[#B9B9B9] focus:outline-none"
          />
          <button
            onClick={send}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-[#67A462] hover:bg-[#5b9457] transition-colors flex items-center justify-center"
            aria-label="전송"
          >
            <img src="/images/icon_send.svg" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}