// src/hooks/useVoiceWebSocketDemo.ts

import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceWs, VoiceWsOptions, AgentStatus } from "./useVoiceWebSocket";

type Step = { role: "agent" | "user"; text: string };

const script: Step[] = [
  // 0) 시작
  { role: "agent", text: "'기쁨아!'라고 불러주세요." },
  { role: "user", text: "기쁨아" },
  // 1) 시작
  { role: "agent", text: "안녕하세요, 영수님. 저는 앞으로 생활을 함께 챙겨드릴 기쁨이에요.\n몇 가지 여쭤봐도 괜찮을까요?" },
  { role: "user", text: "그래, 괜찮아." },

  // 1) 생활 패턴
  { role: "agent", text: "영수님, 아침에는 보통 몇 시쯤 일어나세요?" },
  { role: "user", text: "나는 7시 반쯤 일어나." },
  { role: "agent", text: "밤에는 몇 시쯤 주무시나요?" },
  { role: "user", text: "보통 10시쯤 자." },
  { role: "agent", text: "식사 시간은 어떻게 되세요? 아침, 점심, 저녁 정도만 알려주셔도 돼요." },
  { role: "user", text: "아침은 8시, 점심은 12시, 저녁은 6시." },
  { role: "agent", text: "혹시 산책이나 외출은 주로 언제 하세요?" },
  { role: "user", text: "날 좋으면 오후 3시쯤 나가." },

  // 2) 건강 관련
  { role: "agent", text: "영수님, 건강 때문에 챙기고 계신 게 있으실까요? 예를 들면 혈압이나 당뇨 같은 거요." },
  { role: "user", text: "고혈압, 당뇨 둘 다 있어." },
  { role: "agent", text: "그럼 정기적으로 병원에 가시는 일정이 있으신가요?" },
  { role: "user", text: "매달 첫째 주 수요일에 가." },
  { role: "agent", text: "드시는 약은 ‘혈압약’, ‘저녁약’처럼 편하게 말씀해주셔도 괜찮아요.\n언제 드시는지만 알려주실까요?" },
  { role: "user", text: "아침에 혈압약 하나, 저녁에 당뇨약 하나 먹어." },

  // 3) 비상 연락망
  { role: "agent", text: "급할 때 연락드릴 가족이나 보호자분을 알려주실 수 있을까요?" },
  { role: "user", text: "딸 김지은 전화번호는 010-1234-5678." },
  { role: "agent", text: "또 다른 분도 알려주실 수 있을까요?" },
  { role: "user", text: "아들 김민수 010-9876-5432." },

  // 4) 개인화
  { role: "agent", text: "영수님, 어떤 이야기를 나누는 게 즐거우세요? 가족 이야기, 동네 소식, 음악 같은 거요." },
  { role: "user", text: "가족 이야기랑 동네 소식이 좋아." },
  { role: "agent", text: "제가 말씀드릴 때 차분하게 할까요, 명랑하게 할까요?" },
  { role: "user", text: "차분하게 해줘." },

  // 5) 요약 & 확인
  {
    role: "agent", text: [
      "정리해드릴게요, 영수님.",
      "아침 7시 30분 기상, 밤 10시 취침,",
      "식사는 아침 8시, 점심 12시, 저녁 6시,",
      "산책은 오후 3시.",
      "건강은 혈압, 당뇨 관리 중이시고, 병원은 매달 첫째 주 수요일.",
      "아침엔 혈압약, 저녁엔 당뇨약.",
      "비상 연락망은 따님 김지은, 아드님 김민수.",
      "이야기는 가족과 동네 소식을 좋아하시고, 말투는 차분하게. 맞으실까요?",
    ].join("\n")
  },
  { role: "user", text: "응, 맞아." },

  // 6) 마무리
  { role: "agent", text: "완료했습니다, 영수님. 오늘부터 일정에 맞춰 잘 챙겨드릴게요.\n필요하실 때 언제든 ‘기쁨아’ 하고 불러주세요." },
  { role: "user", text: "고마워, 기쁨아." },

  // 7) 다음날 아침
  { role: "agent", text: "좋은 아침이에요, 어르신. 오늘은 날씨가 맑고 바람도 선선하네요. 집 근처 산책 다녀오시는 건 어떠세요?" },
  { role: "user", text: "그러게 날씨 좋네 잠깐 다녀와야겠다." },

  // 8) 복약 시간 알림
  { role: "agent", text: "영수님, 지금은 아침 약 드실 시간이에요. 혈압약 챙겨드셨나요?" },
  { role: "user", text: "아이고, 알려줘서 고마워." },

  // 9) 대화 및 스토리 추출
  { role: "agent", text: "요즘 가을 바람이 참 좋네요. 영수님께서는 이런 날 어떤 풍경이 떠오르세요?" },
  { role: "user", text: "충주산 캠핑장이 생각나네. 손주들이 뛰어노는게 너무 보기 좋았어" },
  { role: "agent", text: "와, 정말 멋진 풍경이었을 것 같아요. 그때 어떤 기분이 드셨나요?" },
  { role: "user", text: "산에 오르니 바람에 억새가 물결치고, 마음은 고요해지고, 세월이 잠시 멈춘 듯했지." },
  { role: "agent", text: "정말 아름다운 순간이었네요. 오늘 들려주신 이야기는 ‘충주산 캠핑장의 고요함’으로 기록해도 될까요?" },
  { role: "user", text: "그래, 그렇게 해." },

  // 10) 긴급 상황 대응
  { role: "agent", text: "점심 시간인데, 식사 하셨나요?" },
  { role: "agent", text: "30분간 응답이 없습니다. 1차적으로 비상연락망에 연락하도록 하겠습니다." },
  { role: "agent", text: "위급한 상황이시면 '살려줘'라고 말씀해주세요. 119로 바로 연락하도록 하겠습니다." },
  { role: "user", text: "살려줘." },
  { role: "agent", text: "119에 신고를 진행합니다. 잠시만 기다려주세요." },
];

export function useVoiceWebSocketDemo(_opts?: VoiceWsOptions): VoiceWs {
  const [status, setStatus] = useState<AgentStatus>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPushToTalk, setIsPushToTalk] = useState(false);
  const [agentText, setAgentText] = useState("");
  const [transcript, setTranscript] = useState("");
  const [log, setLog] = useState<string[]>([]);

  const timersRef = useRef<number[]>([]);
  const remainingRef = useRef<Step[]>([...script]);

  const appendLog = useCallback((msg: string) => {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-400));
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => {
      try { window.clearTimeout(t); } catch { }
      try { window.clearInterval(t); } catch { }
    });
    timersRef.current = [];
  }, []);

  // helper: push timer id for cleanup
  const pushTimer = useCallback((id: number) => {
    timersRef.current.push(id);
  }, []);

  const connect = useCallback(() => {
    setIsConnected(true);
    appendLog("[DEMO] 연결 (가상)");
  }, [appendLog]);

  const disconnect = useCallback(() => {
    clearTimers();
    setIsConnected(false);
    setIsSpeaking(false);
    setStatus(0);
    appendLog("[DEMO] 연결 해제 (가상)");
  }, [appendLog, clearTimers]);

  const sendJson = useCallback((_obj: unknown) => {
    // no-op in demo
  }, []);

  const advanceDemo = useCallback(() => {
    const steps = remainingRef.current;
    if (!steps.length) {
      appendLog("[DEMO] 더 이상 진행할 대사가 없어요");
      return;
    }
    const step = steps.shift()!;
    // 사용자 턴: 실제 말하듯이 점진적으로 transcript를 채움
    if (step.role === "user") {
      const full = step.text;
      setAgentText("");
      setTranscript("");
      setStatus(1);
      appendLog(`영수님: ${full}`);
      let i = 0;
      const perChar = 55; // ms/char (느리게 말하듯)
      const iv = window.setInterval(() => {
        i++;
        setTranscript(full.slice(0, i));
        if (i >= full.length) {
          window.clearInterval(iv);
          // 말 끝난 뒤 잠시 후 확정
          const id2 = window.setTimeout(() => setStatus(0), 250);
          timersRef.current.push(id2);
        }
      }, perChar);
      timersRef.current.push(iv as unknown as number);
      return;
    }
    // 에이전트 턴
    setTranscript("");
    setStatus(3);
    setIsSpeaking(true);
    setAgentText(step.text);
    appendLog(`기쁨이: ${step.text.replace(/\n/g, " ")}`);
    const speakMs = Math.min(6000, step.text.length * 28 + 700);
    const id = window.setTimeout(() => {
      setIsSpeaking(false);
      setStatus(0);
    }, speakMs);
    timersRef.current.push(id);
  }, [appendLog]);

  const startStream = useCallback(async () => {
    // 데모에서는 클릭-한-턴 진행과 동일하게 동작시킴
    advanceDemo();
  }, [advanceDemo]);

  const stopStream = useCallback(() => {
    clearTimers();
    setStatus(0);
    setIsSpeaking(false);
    setTranscript("");
    appendLog("[DEMO] 스트리밍 중지");
  }, [appendLog, clearTimers]);

  const pushToTalkStart = useCallback(async () => {
    setIsPushToTalk(true);
    connect();
    advanceDemo();
    appendLog("[DEMO] 눌러서 말하기 시작 (가상)");
  }, [appendLog, connect, advanceDemo]);

  const pushToTalkStop = useCallback(() => {
    setIsPushToTalk(false);
    appendLog("[DEMO] 눌러서 말하기 종료 (가상)");
  }, [appendLog]);

  // 페이지 진입 시 자동으로 첫 인사 한 줄만 출력
  useEffect(() => {
    connect();
    if (remainingRef.current.length && remainingRef.current[0].role === "agent") {
      const first = remainingRef.current.shift()!;
      setStatus(3);
      setIsSpeaking(true);
      setAgentText(first.text);
      appendLog(`기쁨이: ${first.text.replace(/\n/g, " ")}`);
      const speakMs0 = Math.min(6000, first.text.length * 28 + 700);
      const id = window.setTimeout(() => {
        setIsSpeaking(false);
        setStatus(0);
      }, speakMs0);
      pushTimer(id);
    }
  }, [connect, appendLog, pushTimer]);

  useEffect(() => () => {
    // cleanup on unmount
    clearTimers();
  }, [clearTimers]);

  return {
    status,
    isConnected,
    isSpeaking,
    isPushToTalk,
    agentText,
    transcript,
    log,
    advanceDemo,
    startStream,
    stopStream,
    pushToTalkStart,
    pushToTalkStop,
    connect,
    disconnect,
    sendJson,
  };
}
