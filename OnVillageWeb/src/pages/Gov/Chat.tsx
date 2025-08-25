// src/pages/Gov/Chat.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Menu, Play, Download, Send, ChevronRight } from "lucide-react";

// 색상 토큰 (디자인 톤앤톤)
const colors = {
  bg: "#FFF8E8", // 전체 배경 (연한 크림)
  green: "#5DBB63",
  greenDark: "#3FAE4F",
  orange: "#FFA64D",
  orangeDark: "#FF8A00",
  text: "#2C2C2C",
  bubble: "#FFFFFF",
};

// 타입들
type Role = "user" | "assistant" | "system" | "chip";

type MsgKind = "text" | "scenario" | "video" | "chip";

interface Message {
  id: string;
  role: Role;
  kind: MsgKind;
  content: string;
  meta?: Record<string, any>;
}

// -------------------- 더미 API (백엔드 연동 자리) --------------------
// 실제 연동 시 /src/lib/api.ts로 이동
async function sendChatToBackend(input: string, ctx: { tone?: string }) {
  // TODO: fetch(`${API_BASE}/shortform/chat`, { method: 'POST', body: ... })
  // 여기서는 데모 응답을 반환
  await new Promise((r) => setTimeout(r, 600));

  if (input.includes("강강술래") || ctx.tone === "친근한 유튜버") {
    return [
      {
        type: "scenario",
        text:
          "시나리오가 완성됐습니다!\n전체 흐름은 이렇게 구성되어요:\n\n📌 제목: 진도 진도전통문화축제 현장 체험기\n💬 감정 톤: 친근한 소개 → 호기심 → 체험 즐거움 → 깊은 몰입 → 따뜻한 마무리\n✨ 대표 체험: 강강술래\n\n• 씬 1 [소개]: \"안녕하세요! 오늘은 진도전통문화축제에 왔어요. 진도의 특별한 문화를 직접 체험해볼 예정인데요, 같이 보실까요?\"\n• 씬 2 [체험]: \"이게 바로 강강술래예요! 생각보다 훨씬 재밌네요. 이렇게 손을 잡고 돌면서 노래를 부르는 거고요!\"\n• 씬 3 [반응]: \"와, 진도의아리랑을 직접 배워보니까 이해가 되네요! 이 멜로디에 담긴 의미가 정말 깊어요.\"\n• 씬 4 [몰입]: \"진도의 전통 춤을 직접춰보니까 너무 아름다워요! 여러분도 꼭 체험해보세요!\"\n• 씬 5 [마무리]: \"진도전통문화축제 정말 특별한 경험이었어요! 다음에 또 와서 더 많은 체험을 해보고 싶어요.\"",
      },
      {
        type: "chip",
        text: "좋아 이렇게 숏폼 제작해줘",
      },
      {
        type: "video",
        text: "demo-video-id",
        thumb:
          "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop",
      },
    ];
  }

  return [
    { type: "text", text: "좋아요! 어떤 축제와 대표 체험으로 시작할까요?" },
  ];
}

// -------------------- 원자 컴포넌트 --------------------
const HeaderMobile: React.FC<{ onMenu: () => void }> = ({ onMenu }) => (
  <div
    className="sticky top-0 z-30 flex h-14 items-center justify-between px-4"
    style={{ background: colors.bg }}
  >
    <div className="flex items-center gap-2">
      <span className="font-semibold text-[18px]" style={{ color: colors.text }}>
        ON마을
      </span>
      <span
        className="rounded-full px-2 py-[2px] text-xs font-semibold"
        style={{ background: "#E6F6EA", color: colors.greenDark }}
      >
        공무원
      </span>
    </div>
    <button
      aria-label="메뉴"
      className="rounded-full p-2 hover:bg-black/5"
      onClick={onMenu}
    >
      <Menu size={22} />
    </button>
  </div>
);

const Sidebar: React.FC<{ current: string; onSelect: (k: string) => void }> = ({
  current,
  onSelect,
}) => (
  <aside className="hidden md:block md:col-span-3 lg:col-span-2">
    <div className="sticky top-4 flex flex-col gap-2 p-3">
      <h1 className="mb-2 flex items-center gap-2 text-lg font-semibold">
        <span>ON마을</span>
        <span className="rounded-full bg-green-100 px-2 py-[2px] text-[11px] font-semibold text-green-700">
          공무원
        </span>
      </h1>
      <NavItem
        active={current === "make"}
        onClick={() => onSelect("make")}
        label="숏폼 제작하기"
      />
      <NavItem
        active={current === "list"}
        onClick={() => onSelect("list")}
        label="제작물 리스트"
      />
    </div>
  </aside>
);

const NavItem: React.FC<{
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition hover:shadow-sm ${active ? "border-green-400 bg-green-50" : "border-black/10 bg-white"
      }`}
  >
    <span className="text-sm">{label}</span>
    <ChevronRight size={16} />
  </button>
);

const ChatBubble: React.FC<{
  role: Role;
  children: React.ReactNode;
  tone?: "green" | "white";
}> = ({ role, children, tone = "white" }) => {
  const isUser = role === "user" || role === "chip";
  const align = isUser ? "items-end" : "items-start";
  const bubbleColor =
    tone === "green"
      ? "bg-green-100 text-green-900 border-green-200"
      : "bg-white text-black border-black/10";

  return (
    <div className={`flex ${align} w-full`}>
      <div
        className={`max-w-[80%] rounded-2xl border px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.03)] ${bubbleColor}`}
      >
        <div className="whitespace-pre-wrap text-[13.5px] leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

const ScenarioCard: React.FC<{ text: string }> = ({ text }) => (
  <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
    <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">{text}</p>
  </div>
);

const VideoCard: React.FC<{ thumb?: string; onDownload?: () => void }> = ({
  thumb,
  onDownload,
}) => (
  <div className="w-full max-w-[340px] rounded-2xl border border-black/10 bg-white p-3 shadow-sm">
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
      <img
        src={
          thumb ||
          "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop"
        }
        alt="video thumbnail"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 backdrop-blur">
          <Play className="text-white" />
        </div>
      </div>
    </div>
    <button
      onClick={onDownload}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
      style={{ background: colors.orange }}
    >
      다운로드 <Download size={16} />
    </button>
  </div>
);

const InputBar: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
}> = ({ value, onChange, onSend }) => (
  <div className="sticky bottom-0 z-20 mt-3 w-full">
    <div className="rounded-2xl border border-black/10 bg-white p-1 pl-3 shadow-sm">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="제작하고 싶은 홍보물 내용을 입력하세요"
          className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-black/40"
        />
        <button
          onClick={onSend}
          className="mr-1 flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: colors.green, color: "white" }}
          aria-label="전송"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  </div>
);

// -------------------- 페이지 --------------------
export default function ShortformMakerResponsive() {
  const [currentTab, setCurrentTab] = useState("make");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: crypto.randomUUID(),
      role: "assistant",
      kind: "text",
      content:
        "좋아요! [진도전통문화축제] 시나리오를 만들어볼게요.\n이 축제에서 가장 특별하다고 생각하는 대표 체험은 무엇인가요?",
    },
    {
      id: crypto.randomUUID(),
      role: "user",
      kind: "text",
      content: "강강술래",
    },
    {
      id: crypto.randomUUID(),
      role: "assistant",
      kind: "text",
      content:
        "강강술래를 중심으로 스토리를 구성해볼게요.\n시나리오의 대사는 어떤 톤을 원하시나요?\n\n1. 친근한 여행 유튜버 스타일\n2. 차분한 해설형\n3. 활기찬 MC 톤",
    },
    {
      id: crypto.randomUUID(),
      role: "user",
      kind: "text",
      content: "1번",
    },
  ]);

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim() || pending) return;
    const text = input.trim();
    setInput("");

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      kind: "text",
      content: text,
    };
    setMessages((m) => [...m, userMsg]);

    setPending(true);
    try {
      const resp = await sendChatToBackend(text, {});
      const next: Message[] = resp.map((r: any) => {
        if (r.type === "scenario")
          return {
            id: crypto.randomUUID(),
            role: "assistant",
            kind: "scenario",
            content: r.text,
          };
        if (r.type === "video")
          return {
            id: crypto.randomUUID(),
            role: "assistant",
            kind: "video",
            content: r.text,
            meta: { thumb: r.thumb },
          };
        if (r.type === "chip")
          return {
            id: crypto.randomUUID(),
            role: "chip",
            kind: "chip",
            content: r.text,
          };
        return {
          id: crypto.randomUUID(),
          role: "assistant",
          kind: "text",
          content: r.text,
        };
      });
      setMessages((m) => [...m, ...next]);
    } finally {
      setPending(false);
    }
  };

  const bgStyle = useMemo(() => ({ background: colors.bg }), []);

  return (
    <div className="min-h-dvh w-full" style={bgStyle}>
      {/* 모바일 헤더 */}
      <div className="md:hidden">
        <HeaderMobile onMenu={() => { }} />
      </div>

      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-4 px-4 pb-6 md:grid-cols-12 md:gap-6 md:px-6 lg:px-8">
        {/* 좌측 사이드바 (md이상) */}
        <Sidebar current={currentTab} onSelect={setCurrentTab} />

        {/* 메인 채팅 */}
        <main className="md:col-span-9 lg:col-span-8">
          <div className="mx-auto flex max-w-[720px] flex-col gap-3 pt-2">
            {/* 시나리오 안내 말풍선 */}
            <div ref={listRef} className="flex flex-col gap-3">
              {messages.map((m) => {
                if (m.kind === "scenario") {
                  return (
                    <ScenarioCard key={m.id} text={m.content} />
                  );
                }
                if (m.kind === "video") {
                  return (
                    <div key={m.id} className="flex w-full justify-start">
                      <VideoCard
                        thumb={m.meta?.thumb}
                        onDownload={() => alert("다운로드 (데모)")}
                      />
                    </div>
                  );
                }
                if (m.kind === "chip") {
                  return (
                    <ChatBubble key={m.id} role="chip" tone="green">
                      {m.content}
                    </ChatBubble>
                  );
                }
                return (
                  <ChatBubble key={m.id} role={m.role}>
                    {m.content}
                  </ChatBubble>
                );
              })}

              {pending && (
                <ChatBubble role="assistant">생성 중…</ChatBubble>
              )}
            </div>

            {/* 입력 바 */}
            <InputBar value={input} onChange={setInput} onSend={handleSend} />

            {/* 푸터 (데스크톱 스타일에 맞춰 간결히) */}
            <div className="mt-8 text-center text-xs text-black/50">
              © 2025 ON마을 by 내일더함 │ 문의: contact@naedam.kr │ 02-1234-5678
              <div className="mt-1 flex justify-center gap-3">
                <a className="underline" href="#">이용약관</a>
                <a className="underline" href="#">개인정보처리방침</a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// -------------------- 백엔드 연동 메모 --------------------
// 1) .env
//    VITE_API_BASE=https://api.on-village.kr
// 2) /src/lib/api.ts 예시
//    export const API_BASE = import.meta.env.VITE_API_BASE
//    export async function chat(sessionId: string, text: string) {
//      const res = await fetch(`${API_BASE}/shortform/chat`, {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ sessionId, text }),
//      })
//      return res.json()
//    }
//    export async function generateShortform(sessionId: string, payload: { topic: string; tone: string; region?: string }) { /* ... */ }
//    // 스트리밍 원하면 SSE
//    // const es = new EventSource(`${API_BASE}/shortform/stream?sessionId=...`)
//    // 혹은 WebSocket으로 토큰 단위 응답을 받아 채팅 말풍선에 스트리밍 적용
// 3) 서버는 messages[{role, content}] 형태를 받아 LLM 프롬프트를 구성하고,
//    - scenario (markdown/text)
//    - actions: ["GENERATE_VIDEO"]
//    - video: { id, thumbUrl, downloadUrl }
//    로 응답하면 프론트는 kind에 따라 ScenarioCard/VideoCard로 렌더링.