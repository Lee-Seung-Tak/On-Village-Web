import { useEffect, useRef, useState } from "react";
import { useWS } from "../hooks/useWS";

export default function ChatBox() {
  const { status, messages, send } = useWS();
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const onSend = () => {
    const t = text.trim();
    if (!t) return;
    send({ type: "chat.send", text: t }); // 서버 이벤트명은 백이 뭐든, 프론트는 그대로 보냄
    setText("");
  };

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-3">
      <div className="text-xs text-gray-500">WS: {status}</div>
      <div ref={listRef} className="h-72 border rounded p-3 overflow-auto bg-white">
        {messages.map((m, i) => (
          <div key={i} className="mb-2 text-sm break-words">{JSON.stringify(m)}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="메시지를 입력하세요"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
        />
        <button className="px-4 py-2 rounded bg-black text-white" onClick={onSend}>보내기</button>
      </div>
    </div>
  );
}