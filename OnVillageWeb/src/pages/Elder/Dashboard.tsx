// src/pages/Elder/Dashboard.tsx

import { useEffect, useRef, useState } from "react";
import HeaderEld from "../../components/layout/HeaderEld";
import PaginatedVoiceBubble from "../../components/elder/PaginatedVoiceBubble";
import MicButton from "../../components/elder/MicButton";
import ElderAvatar, { type Mood } from "../../components/elder/ElderAvatar";
// import VoiceLog from "../../components/elder/VoiceLog";
import { useTypewriter } from "../../hooks/useTypewriter";
import { VoiceWsProvider, useVoiceWs } from "../../contexts/VoiceWsContext";
import ConsentModal from "../../components/elder/ConsentModal";

type Utt = { id: string; role: "agent" | "user"; text: string };

// 데모: 생각 상태로 전환을 유도할 키워드(필요시 수정)
// const triggerThinking = (t: string) =>
//   /(아파|통증|걱정|우울|어지럽|위험|119|어떡해|고민)/.test(t);

function DashboardBody() {
  const [mood, setMood] = useState<Mood>("idle");
  const [utts, setUtts] = useState<Utt[]>([]);
  const [showConsent, setShowConsent] = useState(false);

  // Typing effect for the latest agent message
  const last = utts[utts.length - 1];
  const isAgentLast = last?.role === "agent";
  const typed = useTypewriter(isAgentLast ? last.text : "", { speed: 25, instant: !isAgentLast });
  const { agentText, transcript, status } = useVoiceWs();
  const typedAgent = useTypewriter(agentText, { speed: 25, instant: false });

  // 라이브 STT 버블의 id 추적
  const liveUserIdRef = useRef<string | null>(null);

  // transcript 변화를 실시간 유저 말풍선으로 반영
  useEffect(() => {
    const t = transcript?.trim() ?? "";
    if (status === 1 || status === 2) {
      // 청취/생각 중에는 들어오는 STT를 계속 같은 말풍선에 반영
      if (t.length === 0) return;
      if (!liveUserIdRef.current) {
        const id = crypto.randomUUID();
        liveUserIdRef.current = id;
        setUtts(prev => [...prev, { id, role: "user", text: t }]);
      } else {
        const id = liveUserIdRef.current;
        setUtts(prev => prev.map(u => (u.id === id ? { ...u, text: t } : u)));
      }
      return;
    }
    // speaking(3) 또는 idle(0)로 넘어가면 라이브 버블 확정 (최신 STT로 보강)
    if (liveUserIdRef.current) {
      const id = liveUserIdRef.current;
      const finalText = (transcript ?? "").trim();
      setUtts(prev => {
        const found = prev.find(u => u.id === id);
        if (!found) return prev;
        const updated = prev.map(u => (u.id === id ? { ...u, text: finalText || u.text } : u));
        if ((finalText || found.text || "").trim().length === 0) {
          return updated.filter(u => u.id !== id);
        }
        return updated;
      });
      liveUserIdRef.current = null;
    }
  }, [transcript, status]);

  // 에이전트 발화가 시작되면(텍스트가 등장) 사용자 라이브 버블을 최종 스냅샷으로 보강 후 확정
  useEffect(() => {
    if (!agentText) return;
    if (!liveUserIdRef.current) return;
    const id = liveUserIdRef.current;
    const finalText = (transcript ?? "").trim();
    setUtts(prev => {
      const found = prev.find(u => u.id === id);
      if (!found) return prev;
      const updated = prev.map(u => (u.id === id ? { ...u, text: finalText || u.text } : u));
      if ((finalText || found.text || "").trim().length === 0) {
        return updated.filter(u => u.id !== id);
      }
      return updated;
    });
    liveUserIdRef.current = null;
  }, [agentText]);

  // 최종 STT가 늦게 도착하는 경우(이미 확정됐더라도) 마지막 사용자 말풍선을 보강 업데이트
  useEffect(() => {
    const t = (transcript ?? "").trim();
    if (!t) return;
    if (status === 1) return; // live 업데이트는 위 effect에서 처리
    setUtts(prev => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      if (last.role !== "user") return prev;
      if ((last.text ?? "").length >= t.length) return prev;
      const updated = prev.slice();
      updated[updated.length - 1] = { ...last, text: t };
      return updated;
    });
  }, [transcript, status]);

  // 마이크 버튼(보이스 SDK 붙이면 onStart/onEnd에서 이 함수와 동일하게 호출)
  // const toggleMic = () => setListening(v => !v);

  // 상태 코드 + 타이핑 상황에 따라 캐릭터 이미지 변경
  useEffect(() => {
    const emergency = /(응답이 없습니다|위급한 상황|119|신고를 진행합니다)/.test(agentText ?? "") || /(살려줘)/.test((transcript ?? ""));
    if (emergency) {
      setMood("alert");
      return;
    }
    // 사용자가 말하는 중이면 최우선
    if (status === 1) {
      setMood("listening");
      return;
    }
    // 에이전트가 말하는 중이거나(상태 3), 타이핑이 아직 끝나지 않았다면 speaking 유지
    if (status === 3 || (!!agentText && !typedAgent.done)) {
      setMood("speaking");
      return;
    }
    if (status === 2) {
      setMood("tinking");
      return;
    }
    setMood("idle");
  }, [status, agentText, transcript, typedAgent.done]);

  // (데모용 로컬 토글은 비활성화)
  // 최초 진입 시 동의 팝업 노출(이미 선택한 경우는 생략)
  useEffect(() => {
    try {
      const key = "elderConsentStory";
      const saved = localStorage.getItem(key);
      if (!saved) setShowConsent(true);
    } catch {
      setShowConsent(true);
    }
  }, []);

  // 복약 알림 키워드/시간 파싱 (말풍선 내부 표시용)
  const medInfo = (() => {
    const t = agentText ?? "";
    if (!t) return null;
    // 복약 시간 알림에 해당하는 문장만 감지 ("약 드실 시간"/"복약 시간"/"복약 알림")
    const isMed = /(드실\s*시간|복약\s*(?:시간|알림)|약\s*드실\s*시간)/.test(t);
    if (!isMed) return null;
    let timeStr: string | undefined;
    const m1 = t.match(/(오전|오후)\s*(\d{1,2})(?:[:시]\s*(\d{1,2}))?/);
    const m2 = t.match(/(\d{1,2})\s*시\s*(\d{1,2})?\s*분?/);
    if (m1) {
      const ap = m1[1];
      const hh = m1[2];
      const mm = m1[3] ?? "00";
      timeStr = `${ap} ${hh}:${mm.padStart(2, "0")}`;
    } else if (m2) {
      const hh = m2[1];
      const mm = (m2[2] ?? "00").toString();
      timeStr = `${hh}:${mm.padStart(2, "0")}`;
    } else if (/아침/.test(t)) {
      timeStr = "08:00";
    } else if (/점심/.test(t)) {
      timeStr = "12:00";
    } else if (/저녁/.test(t)) {
      timeStr = "18:00";
    }
    return { time: timeStr } as { time?: string };
  })();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7ED]">
      <HeaderEld />

      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-8 md:py-12">
          <ConsentModal
            open={showConsent}
            onAgree={() => {
              try { localStorage.setItem("elderConsentStory", "agree"); } catch { }
              setShowConsent(false);
            }}
            onDisagree={() => {
              try { localStorage.setItem("elderConsentStory", "disagree"); } catch { }
              setShowConsent(false);
            }}
          />
          {/* 캐릭터: 크기 키움 */}
          <div className="flex justify-center">
            <ElderAvatar
              mood={mood}
              className="w-[240px] md:w-[300px] h-auto relative z-10"
            />
          </div>

          {/* 말풍선: 캐릭터와 겹치게 (Tailwind JIT: -mt-[px] 허용) */}
          {(() => {
            // 청취(status===1) 시에는 transcript 길이와 무관하게 사용자 말풍선을 먼저 노출해
            // 직전 에이전트 말풍선이 잔상처럼 보이지 않도록 함
            const showUserLive = status === 1;
            const role = showUserLive ? "user" : (agentText ? "agent" : (last?.role ?? "agent"));
            const text = showUserLive
              ? transcript
              : agentText
                ? typedAgent.text
                : (isAgentLast ? typed.text : (last?.text ?? ""));

            // 페이지네이션 말풍선으로 렌더
            return (
              <div className="-mt-[120px] md:-mt-[130px] relative z-20">
                <PaginatedVoiceBubble
                  key={last?.id}
                  role={role}
                  text={text}
                  className=""
                  // 화면 비율 조정: 한 화면에 들어오도록 34vh 기준
                  maxVhRatio={0.34}
                  header={role === "agent" && medInfo ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#F4A241]/40 bg-[#FFF3E4] px-3 py-1 text-[16px] font-semibold text-[#B46300]">
                      <span aria-hidden>🔔</span>
                      <span>복약 알림</span>
                      {medInfo.time ? <span className="text-[#8B5E00]">· {medInfo.time}</span> : null}
                    </div>
                  ) : null}
                />
              </div>
            );
          })()}

          {/* 안내 문구도 크게 */}
          <p className="mt-3 md:mt-5 text-center text-[23px] md:text-[23px] text-[#3B3B3B]">
            <span className="font-semibold">‘기쁨아’</span>라고 부르면 대화가 시작됩니다
          </p>

          <div className="flex gap-2 justify-center mt-8 md:mt-10">
            <MicButton mode="handsfree" />
            <MicButton mode="hold" />
          </div>
          {/* <VoiceLog /> */}
        </div>
      </main>
    </div>
  );
}

export default function ElderDashboard() {
  return (
    <VoiceWsProvider options={{ url: 'demo' }}>
      <DashboardBody />
    </VoiceWsProvider>
  );
}
