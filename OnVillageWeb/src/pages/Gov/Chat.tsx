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
    { role: "gov", text: "어르신 대화에서 영상으로 만들만한 좋은 이야기가 있을까?" },
    {
      role: "ai", text: [
        "어르신 대화에서 추천드리는 이야기는 두 가지입니다.",
        "1.  '충주산 캠핑장' 아이디어를 발견 했습니다. 충주 지자체 이미지인 수달 이미지를 제안합니다",
        "2.  '한국 민속촌' 아이디어를 발견 했습니다. 용인 지자체 이미지인 용 이미지를 제안합니다",
      ].join("\n")
    },
    // 3. 스토리 선택
    { role: "gov", text: "1번 충주산 캠핑장 이야기를 수달 이미지를 사용해서 영상으로 만들어줘." },
    { role: "ai", text: "네, 충주산 캠핑장으로 영상 시나리오를 생성 하겠습니다." },
    // 4. 시나리오 초안 받기
    {
      role: "ai", text: [
        " 시나리오 : 충주산 캠핑장의 단풍을 즐기는 수달.",
        " 장면 진행: 수달이 호기심 -> 탐험 -> 발견 -> 즐거움 -> 만족감 순서대로 장면이 진행",
        " 배경: 밝고 따듯한 동화적 스타일",
        " 상황: 클로즈업으로 눈과 꽃잎 디테일 포착",
        " 카메라: 수달 얼굴 중심 구도",

        "이대로 진행해도 될까요 ?"
      ].join("\n")
    },
    { role: "gov", text: "마지막 장면에는 저녁 야영을 즐기는 모습이 나왔으면 좋겠어." },
    // 5. 시나리오 수정
    {
      role: "ai", text: [
        " 시나리오 : 충주산 캠핑장의 단풍을 즐기는 수달. 저녁 야영을 즐기는 모습으로 마무리",
        " 장면 진행: 수달이 호기심 -> 탐험 -> 발견 -> 즐거움 -> 만족감 순서대로 장면이 진행",
        " 배경: 밝고 따듯한 동화적 스타일",
        " 상황: 클로즈업으로 눈과 꽃잎 디테일 포착",
        " 카메라: 수달 얼굴 중심 구도",

        "이대로 진행해도 될까요 ?"
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
    // No-flicker: show generated thumbnail until the first frame is ready
    const vRef = useRef<HTMLVideoElement | null>(null);
    const [thumb, setThumb] = useState<string | null>(null);
    const [videoReady, setVideoReady] = useState(false);
    const [needsTap, setNeedsTap] = useState(false);

    // Generate a thumbnail off-DOM to avoid seeking/flicker on the shown element
    useEffect(() => {
      let loader: HTMLVideoElement | null = document.createElement('video');
      const seekTo = 0.12; // move off exact 0s in case of black frames
      let cleaned = false;

      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        if (loader) {
          try {
            loader.pause();
            loader.removeAttribute('src');
            // @ts-ignore: load exists
            loader.load?.();
          } catch {}
        }
        loader = null;
      };

      if (!loader) return cleanup;
      try {
        loader.src = src;
        loader.muted = true;
        loader.playsInline = true as any;
        loader.preload = 'metadata';
        const onSeeked = () => {
          try {
            const w = loader!.videoWidth || 640;
            const h = loader!.videoHeight || 360;
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            const ctx = c.getContext('2d');
            if (ctx) {
              ctx.drawImage(loader as HTMLVideoElement, 0, 0, w, h);
              setThumb(c.toDataURL('image/jpeg', 0.85));
            }
          } catch {}
          cleanup();
        };
        const onLoaded = () => {
          try { loader!.currentTime = seekTo; }
          catch { onSeeked(); }
        };
        loader.addEventListener('loadeddata', onLoaded, { once: true } as any);
        loader.addEventListener('loadedmetadata', onLoaded, { once: true } as any);
      } catch {
        cleanup();
      }

      return cleanup;
    }, [src]);

    // Reveal the actual video only after first frame is ready to paint
    useEffect(() => {
      const v = vRef.current;
      if (!v) return;
      let done = false;
      let watchdog: number | null = null;

      const readyNow = () => {
        if (!done) { done = true; setVideoReady(true); }
      };
      const tryFrame = () => {
        const anyV: any = v as any;
        if (typeof anyV.requestVideoFrameCallback === 'function') {
          anyV.requestVideoFrameCallback(() => {
            try { v.pause(); } catch {}
            window.setTimeout(readyNow, 30);
          });
        } else {
          try { v.pause(); } catch {}
          window.setTimeout(readyNow, 60);
        }
      };
      const onBaseReady = () => tryFrame();

      // If already sufficiently loaded (e.g., cache), reveal immediately
      try {
        if (v.readyState >= (v.HAVE_CURRENT_DATA ?? 2)) {
          tryFrame();
        }
      } catch {}

      v.addEventListener('canplay', onBaseReady, { once: true } as any);
      v.addEventListener('loadeddata', onBaseReady, { once: true } as any);
      v.addEventListener('canplaythrough', onBaseReady, { once: true } as any);

      // Watchdog: if nothing fired but data is present later, unstick
      watchdog = window.setTimeout(() => {
        try {
          if (!done && v.readyState >= (v.HAVE_CURRENT_DATA ?? 2)) {
            tryFrame();
          }
          if (!done && v.readyState < (v.HAVE_METADATA ?? 1)) {
            // Likely blocked by autoplay policy; request user interaction
            setNeedsTap(true);
          }
        } catch {}
      }, 1500);

      return () => {
        try {
          v.removeEventListener('canplay', onBaseReady as any);
          v.removeEventListener('loadeddata', onBaseReady as any);
          v.removeEventListener('canplaythrough', onBaseReady as any);
        } catch {}
        if (watchdog) {
          try { window.clearTimeout(watchdog); } catch {}
        }
      };
    }, [src]);

    const kickstart = () => {
      const v = vRef.current;
      if (!v) return;
      try {
        v.muted = true;
        (v as any).playsInline = true;
        v.play().then(() => {
          // Pause on first painted frame then reveal
          const anyV: any = v as any;
          if (typeof anyV.requestVideoFrameCallback === 'function') {
            anyV.requestVideoFrameCallback(() => {
              try { v.pause(); } catch {}
              setVideoReady(true);
              setNeedsTap(false);
            });
          } else {
            setTimeout(() => {
              try { v.pause(); } catch {}
              setVideoReady(true);
              setNeedsTap(false);
            }, 80);
          }
        }).catch(() => {
          // If play still blocked, keep tap overlay
          setNeedsTap(true);
        });
      } catch {
        setNeedsTap(true);
      }
    };

    return (
      <div className="relative w-full max-w-[560px] rounded-lg border border-[#EFEDE4] overflow-hidden" style={{ maxHeight: 320 }}>
        {/* aspect-ratio without relying on CSS aspect-ratio support */}
        <div className="pt-[56.25%]" />

        {/* Overlay placeholder (thumb or spinner) */}
        {!videoReady && (
          <button
            type="button"
            onClick={needsTap ? kickstart : undefined}
            className="absolute inset-0 flex items-center justify-center bg-[#F7F4EA]"
          >
            {thumb ? (
              <img src={thumb} alt="thumbnail" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-[#D9D4C7] border-t-[#67A462] animate-spin" />
            )}
            {needsTap && (
              <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
                탭하여 로드
              </div>
            )}
          </button>
        )}

        {/* Actual video (fades in) */}
        <video
          ref={vRef}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: videoReady ? 1 : 0, transition: 'opacity 180ms ease-out' }}
          src={src}
          controls
          preload="auto"
          muted
          playsInline
          autoPlay
        />
      </div>
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
                const videoSrc = "/media/demo7.mp4"; // 데모 경로 
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
