// src/pages/Elder/Dashboard.tsx

import { useEffect, useRef, useState } from "react";
import HeaderEld from "../../components/layout/HeaderEld";
import VoiceBubble from "../../components/elder/VoiceBubble";
import MicButton from "../../components/elder/MicButton";
import ElderAvatar, { type Mood } from "../../components/elder/ElderAvatar";
import VoiceLog from "../../components/elder/VoiceLog";
import { useTypewriter } from "../../hooks/useTypewriter";
import { VoiceWsProvider, useVoiceWs } from "../../contexts/VoiceWsContext";

type Utt = { id: string; role: "agent" | "user"; text: string };

// 데모: 생각 상태로 전환을 유도할 키워드(필요시 수정)
const triggerThinking = (t: string) =>
  /(아파|통증|걱정|우울|어지럽|위험|119|어떡해|고민)/.test(t);

function DashboardBody() {
  const [listening, setListening] = useState(false);
  const [mood, setMood] = useState<Mood>("idle");
  const [utts, setUtts] = useState<Utt[]>([
    {
      id: "u1",
      role: "agent",
      text: "00님,\n오늘 날씨 정말 좋아요!\n가볍게 산책 다녀오시면 기분도 좋아질 거예요!",
    },
  ]);

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
    if (status === 1) {
      // listening 중: 라이브 말풍선 갱신/생성
      if (t.length === 0) return;
      if (!liveUserIdRef.current) {
        const id = crypto.randomUUID();
        liveUserIdRef.current = id;
        setUtts(prev => [...prev, { id, role: "user", text: t }]);
      } else {
        const id = liveUserIdRef.current;
        setUtts(prev => prev.map(u => (u.id === id ? { ...u, text: t } : u)));
      }
    } else {
      // listening 벗어남(thinking/speaking 등): 라이브 버블 확정
      if (liveUserIdRef.current) {
        const id = liveUserIdRef.current;
        // 빈 텍스트였다면 제거
        setUtts(prev => {
          const found = prev.find(u => u.id === id);
          if (found && (found.text ?? "").trim().length === 0) {
            return prev.filter(u => u.id !== id);
          }
          return prev;
        });
        liveUserIdRef.current = null;
      }
    }
  }, [transcript, status]);

  // 마이크 버튼(보이스 SDK 붙이면 onStart/onEnd에서 이 함수와 동일하게 호출)
  // const toggleMic = () => setListening(v => !v);

  // STT 진행 중 → listening
  useEffect(() => {
    setMood(listening ? "listening" : "idle");
  }, [listening]);

  // 유저 발화가 들어오면 상태 전환
  useEffect(() => {
    const last = utts[utts.length - 1];
    if (!last) return;

    if (last.role === "user") {
      if (triggerThinking(last.text)) {
        setMood("tinking");      // 생각(걱정) 상태
        const t = setTimeout(() => setMood("idle"), 4000);
        return () => clearTimeout(t);
      } else {
        // 에이전트 답변 준비/재생 구간을 speaking으로 표현
        setMood("speaking");
        const t = setTimeout(() => setMood("idle"), 1200);
        return () => clearTimeout(t);
      }
    }
  }, [utts]);

  // 데모: listening 켜면 0.8초 후 유저 발화 하나 추가
  useEffect(() => {
    if (!listening) return;
    const t1 = setTimeout(() => {
      setUtts(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", text: "그럴까?" },
      ]);
      setListening(false);
    }, 800);
    return () => clearTimeout(t1);
  }, [listening]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7ED]">
      <HeaderEld />

      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-8 md:py-12">
          {/* 캐릭터: 크기 키움 */}
          <div className="flex justify-center">
            <ElderAvatar
              mood={mood}
              className="w-[240px] md:w-[300px] h-auto relative z-10"
            />
          </div>

          {/* 말풍선: 캐릭터와 겹치게 (Tailwind JIT: -mt-[px] 허용) */}
          {(() => {
            const showUserLive = status === 1 && (transcript?.trim()?.length ?? 0) > 0;
            const role = showUserLive ? "user" : agentText ? "agent" : (last?.role ?? "agent");
            const text = showUserLive
              ? transcript
              : agentText
                ? typedAgent.text
                : (isAgentLast ? typed.text : last?.text ?? "");
            return (
              <VoiceBubble
                key={last?.id}
                role={role}
                className="-mt-[120px] md:-mt-[130px] relative z-20"
              >
                <p className="whitespace-pre-line">{text}</p>
              </VoiceBubble>
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
          <VoiceLog />
        </div>
      </main>
    </div>
  );
}

export default function ElderDashboard() {
  return (
    <VoiceWsProvider>
      <DashboardBody />
    </VoiceWsProvider>
  );
}
