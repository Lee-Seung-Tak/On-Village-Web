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
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [showDebug] = useState(false);
  const [skipThink, setSkipThink] = useState(false);
  const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? (crypto as any).randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

  // 데모 스크립트: AI 자동, 공무원은 수동 입력
  type Step = { role: "ai" | "gov"; text: string };
  const script: Step[] = [
    // AI 첫 인사
    { role: "ai", text: "안녕하세요! 어떤 이야기를 영상으로 만들어드릴까요?" },
    // 2. 스토리 추천 받기
    { role: "gov", text: "이번 주 어떤 이야기를 영상으로 만들면 좋을까?" },
    {
      role: "ai", text: [
        "추천드리는 이야기는 두 가지입니다.",
        "1. ‘오서산 억새밭, 억새가 산을 가득 덮던 모습’",
        "2. ‘대천해수욕장에서 가족과 놀던 추억’",
      ].join("\n")
    },
    // 3. 스토리 선택
    { role: "gov", text: "2번 오서산 억새밭 이야기를 영상으로 만들어줘." },
    { role: "ai", text: "네, 시나리오 초안을 작성하겠습니다." },
    // 4. 시나리오 초안 받기
    {
      role: "ai", text: [
        "씬 : 햇살이 비치는 공원 벤치.",
        " 어르신이 청년과 담소를 나눈다.",
        " 어르신: ‘오서산 억새밭이 생각나네. 은빛 억새가 산을 가득 덮던 모습이 아직도 눈에 선해.’ ",
      ].join("\n")
    },
    { role: "gov", text: "대사를 한다음에 억새밭이 나왔으면 좋겠어" },
    // 5. 시나리오 수정
    {
      role: "ai", text: [
        "씬 : 햇살이 비치는 공원 벤치.",
        " 어르신과 청년이 나란히 앉아 대화를 나눈다.",
        " ‘내가 어렸을 때 오서산 억새밭 뒤에서 자주 놀았는데 정말 예뻤어.’라고 한 뒤",
        "\t\t  오서산 억새밭이 펼쳐집니다.",
        " 어르신이 말하자 화면이 회상 장면으로 전환된다.",
      ].join("\n")
    },
    { role: "gov", text: "응, 이대로 진행하자." },
    // 6. 영상 제작 완료
    {
      role: "ai", text: [
        "영상 제작이 완료되었습니다. 제작물 리스트에서 확인하고 다운로드할 수 있습니다.",
        " 단, 보관 용량은 한정되어 있어 일정 기간이 지나면 자동 삭제될 수 있습니다.",
      ].join("\n")
    },
  ];

  const stepRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const pushTimer = (id: number) => { timersRef.current.push(id); };
  const aiBusyRef = useRef(false);
  const aiRerunRef = useRef(false);
  const didInitRef = useRef(false);

  function AutoPosterVideo({ src }: { src: string }) {
    const vRef = useRef<HTMLVideoElement | null>(null);
    const [poster, setPoster] = useState<string | undefined>(undefined);
    useEffect(() => {
      const v = vRef.current;
      if (!v) return;
      const gen = () => {
        try {
          const seekTo = Math.min(0.15, (v.duration || 1) * 0.05);
          const onSeeked = () => {
            try {
              const w = v.videoWidth || 640;
              const h = v.videoHeight || 360;
              const c = document.createElement('canvas');
              c.width = w; c.height = h;
              const ctx = c.getContext('2d');
              if (ctx) {
                ctx.drawImage(v, 0, 0, w, h);
                setPoster(c.toDataURL('image/jpeg', 0.85));
              }
            } catch { }
            v.removeEventListener('seeked', onSeeked);
          };
          v.addEventListener('seeked', onSeeked);
          try { v.currentTime = seekTo; } catch { }
        } catch { }
      };
      v.addEventListener('loadedmetadata', gen);
      v.addEventListener('loadeddata', gen);
      return () => {
        v.removeEventListener('loadedmetadata', gen);
        v.removeEventListener('loadeddata', gen);
      };
    }, [src]);
    return (
      <video
        ref={vRef}
        className="w-full max-w-[560px] rounded-lg border border-[#EFEDE4]"
        style={{ aspectRatio: '16 / 9', maxHeight: 320 }}
        src={src}
        controls
        playsInline
        poster={poster}
      />
    );
  }

  // 채팅 자동 스크롤
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  // AI 말풍선을 즉시 추가하는 헬퍼
  const pushAi = (text: string) => {
    setMsgs(prev => [...prev, { id: uid(), side: "left", text }]);
  };

  // AI 타이핑처럼 보이게 한 글자씩 출력
  const typeAi = (text: string, immediateFirst = false): Promise<void> => {
    return new Promise<void>((resolve) => {
      const id = uid();
      // 말풍선은 즉시 추가 (StrictMode 대비). 생각 시간에는 '…'로 표시
      setMsgs(prev => [...prev, { id, side: "left", text: immediateFirst ? "" : "…" }]);
      const thinkDelay = (immediateFirst || skipThink) ? 0 : 700 + Math.floor(Math.random() * 600); // 0ms 또는 700~1300ms

      const start = () => {
        let i = 0;
        const step = () => {
          i += 1 + Math.floor(Math.random() * 1); // 1~2자씩
          if (i > text.length) i = text.length;
          const slice = text.slice(0, i);
          setMsgs(prev => prev.map(m => (m.id === id ? { ...m, text: slice } : m)));
          if (i >= text.length) {
            resolve();
          } else {
            const per = 38 + Math.floor(Math.random() * 32); // 38~70ms
            const t = window.setTimeout(step, per);
            pushTimer(t);
          }
        };
        // 즉시 첫 글자부터 보여주기 위해 동기 호출
        step();
      };

      if (thinkDelay === 0) {
        start();
      } else {
        let started = false;
        const t0 = window.setTimeout(() => { started = true; start(); }, thinkDelay);
        pushTimer(t0);
        // 안전장치: 시작이 되지 않으면 지연 후 전체 텍스트로 대체하여 진행이 멈추지 않게 함
        const watchdog = window.setTimeout(() => {
          if (!started) {
            setMsgs(prev => prev.map(m => (m.id === id ? { ...m, text } : m)));
            resolve();
          }
        }, thinkDelay + 1500);
        pushTimer(watchdog);
      }
    });
  };

  // 연속된 AI 단계들을 순차적으로 타이핑 출력
  const runAiQueue = (immediateFirst = false) => {
    if (aiBusyRef.current) { aiRerunRef.current = true; return; }
    aiBusyRef.current = true;
    let first = immediateFirst;
    const runNext = () => {
      if (stepRef.current < script.length && script[stepRef.current].role === "ai") {
        const text = script[stepRef.current].text;
        if (first) {
          // 첫 문장은 안전하게 즉시 전체 출력 (StrictMode에서도 안정적)
          pushAi(text);
          stepRef.current += 1;
          first = false;
          // 지연 없이 즉시 다음 스텝 검사 (타이머 의존성 제거)
          runNext();
        } else {
          typeAi(text, false).then(() => {
            stepRef.current += 1;
            runNext();
          });
        }
      } else {
        aiBusyRef.current = false;
        if (aiRerunRef.current) {
          aiRerunRef.current = false;
          const t = window.setTimeout(() => runAiQueue(), 0);
          pushTimer(t);
        }
      }
    };
    runNext();
  };

  const onSend = (text: string) => {
    // 사용자가 직접 타이핑한 공무원 메시지 추가
    setMsgs(prev => [
      ...prev,
      { id: uid(), side: "right", tone: "green", text },
    ]);

    // 스크립트에서 다음에 기대하는 단계가 공무원이라면 한 단계 소비
    if (stepRef.current < script.length && script[stepRef.current].role === "gov") {
      stepRef.current += 1;
    }
    // 이후 연속된 AI 단계 자동 출력
    runAiQueue();
    // 혹시 타이밍 이슈로 큐가 바쁘면 재시도 예약
    const t = window.setTimeout(() => runAiQueue(), 50);
    pushTimer(t);
  };

  // ===== Debug helpers =====
  const clearAllTimers = () => {
    timersRef.current.forEach((id) => { try { window.clearTimeout(id); } catch { } });
    timersRef.current = [];
  };
  const resetDemo = () => {
    clearAllTimers();
    setMsgs([]);
    stepRef.current = 0;
    aiBusyRef.current = false;
    aiRerunRef.current = false;
    runAiQueue(true);
  };
  const forceNextAi = () => {
    if (aiBusyRef.current) {
      aiRerunRef.current = true;
      return;
    }
    runAiQueue();
  };

  // 첫 진입: 스크립트 시작(연속된 AI 메시지 자동 표시, 첫 문장은 즉시 시작)
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    runAiQueue(true);
    return () => {
      // 타이머 정리
      timersRef.current.forEach((id) => {
        try { window.clearTimeout(id); } catch { }
      });
      timersRef.current = [];
    };
  }, []);

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
              {msgs.map(m => {
                const isFinalAi = m.side === "left" && m.text.startsWith("영상 제작이 완료되었습니다.");
                const videoSrc = "/media/demo1.mp4"; // 데모 경로 
                // poster 이미지는 제거하고, 로딩 후 첫 프레임을 자동 표시하도록 VideoWithAutoPoster 사용
                return (
                  <ChatBubble key={m.id} side={m.side}>
                    <div className="text-[15px] leading-7">
                      <p className="whitespace-pre-line">{m.text}</p>
                      {isFinalAi && (
                        <div className="mt-3 rounded-xl border border-[#E9E6D9] bg-white overflow-hidden">
                          <div className="p-3 flex justify-center">
                            <AutoPosterVideo src={videoSrc} />
                          </div>
                          <div className="px-3 pb-3 flex gap-2">
                            <a
                              className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-[#67A462] text-white text-sm hover:bg-[#5b9457] transition-colors"
                              href={videoSrc}
                              download
                            >
                              다운로드
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </ChatBubble>
                );
              })}
              {/* Debug panel */}
              {showDebug && (
                <div className="mt-4 p-3 rounded-lg border border-dashed border-[#E0DAC7] bg-[#FFFDF5] text-[13px] text-[#3B3B3B]">
                  <div className="font-semibold mb-2">Debug</div>
                  <div>stepRef: {stepRef.current}</div>
                  <div>nextStep: {stepRef.current < script.length ? `${script[stepRef.current].role}: ${script[stepRef.current].text.slice(0, 26)}…` : '끝'}</div>
                  <div>aiBusy: {String(aiBusyRef.current)}</div>
                  <div>aiRerun: {String(aiRerunRef.current)}</div>
                  <div>timers: {timersRef.current.length}</div>
                  <div>msgs: {msgs.length}</div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button onClick={forceNextAi} className="px-3 py-1 rounded-md bg-[#67A462] text-white">다음 AI 강제</button>
                    <button onClick={resetDemo} className="px-3 py-1 rounded-md bg-[#E0E0E0] text-[#3B3B3B]">초기화</button>
                    <label className="inline-flex items-center gap-2 px-2 py-1 rounded-md border border-[#E0E0E0]">
                      <input type="checkbox" checked={skipThink} onChange={(e) => setSkipThink(e.target.checked)} />
                      생각 생략
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 입력창: 하단 고정 (데모 프롬프트 입력 → 좌/우 자동 번갈아) */}
          <div className="sticky bottom-0 z-10 border-t border-[#E9E6D9] bg-white">
            <div className="mx-auto w-full max-w-[900px] px-4 md:px-0 py-4">
              <div className="flex justify-end mb-2">
                {/* <button
                  className="text-[13px] px-3 py-1 rounded-full border border-[#D9D9D9] text-[#3B3B3B] bg-white hover:bg-[#F7F5EE]"
                  onClick={() => setShowDebug(v => !v)}
                >
                  {showDebug ? '디버그 숨기기' : '디버그 보기'}
                </button> */}
              </div>
              <ChatInput onSend={onSend} placeholder="메시지를 입력하세요" />
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
