// MicButton.tsx


import { useMemo } from "react";
import { useVoiceWs } from "../../contexts/VoiceWsContext";
import MicIdle from "../../assets/icons/icon_mic_1.svg"; // 기본 아이콘
import MicWave from "../../assets/icons/icon_mic_2.svg";   // 파형/수신 아이콘


type Props = {
  mode?: "hold" | "handsfree"; // "hold" = 눌러서 말하기, "handsfree" = 연속
  className?: string;
};

export default function MicButton({ mode = "hold", className }: Props) {
  const {
    status,
    isConnected,
    isSpeaking,
    // isPushToTalk,
    startStream,
    stopStream,
    // pushToTalkStart,
    // pushToTalkStop,
    connect,
  } = useVoiceWs();

  // 상태에 따른 라벨(스크린리더)
  const ariaLabel = useMemo(() => {
    if (!isConnected) return "마이크 연결";
    if (isSpeaking) return "음성 재생중";
    if (status === 2) return "응답 생성중";
    if (status === 1) return "청취중";
    return "대기중";
  }, [isConnected, isSpeaking, status]);

  // 공통 스타일(그림자+그라데이션)
  const baseBtn =
    "relative inline-flex items-center justify-center rounded-full " +
    "shadow-[0_8px_18px_rgba(245,104,36,0.35)] " +
    "transition-all duration-150 active:scale-[0.98] " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 " +
    "select-none";

  // 사이즈(모바일 기준 88px, 넓은 화면 96px)
  const size = "w-[96px] h-[96px] md:w-32 md:h-32";

  // 오렌지 톤(톤앤톤)
  const orangeIdle =
    "bg-[#F3A144]";
  const orangeActive =
    "bg-[linear-gradient(180deg,#FF8A1E_0%,#E96515_100%)] ring-4 ring-orange-200";

  // 아이콘 크기
  const icon = "w-15 h-15 md:w-15 md:h-15";

  // ===========================
  // handsfree 모드 (토글)
  // ===========================
  if (mode === "handsfree") {
    const isOn = isConnected && status !== 2; // 생각 중(2)일 때는 아이콘만 유지
    return (
      <button
        aria-label={ariaLabel}
        className={`${baseBtn} ${size} ${isOn ? orangeActive : orangeIdle} ${className ?? ""}`}
        onClick={async () => {
          if (!isConnected) {
            connect();
            await startStream();
          } else {
            stopStream();
          }
        }}
      >
        {/* 하이라이트 링 */}
        <span
          className={`absolute inset-0 rounded-full pointer-events-none 
            ${isOn ? "animate-pingSlow bg-orange-200/25" : ""}`}
        />
        {/* 아이콘 */}
        <img
          src={isOn || status === 1 ? MicWave : MicIdle}
          alt=""
          className={`${icon} drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]`}
        />
      </button>
    );
  }

  //   // ===========================
  //   // hold(눌러서 말하기) 모드
  //   // ===========================
  //   return (
  //     <button
  //       aria-label={ariaLabel}
  //       className={`${baseBtn} ${size} ${isPushToTalk ? orangeActive : orangeIdle} ${className ?? ""}`}
  //       onMouseDown={pushToTalkStart}
  //       onMouseUp={pushToTalkStop}
  //       onTouchStart={pushToTalkStart}
  //       onTouchEnd={pushToTalkStop}
  //     >
  //       {/* 누르는 동안 은은한 확산 효과 */}
  //       <span
  //         className={`absolute inset-0 rounded-full pointer-events-none 
  //           ${isPushToTalk ? "animate-pingSlow bg-orange-200/25" : ""}`}
  //       />
  //       <img
  //         src={isPushToTalk || status === 1 ? MicWave : MicIdle}
  //         alt=""
  //         className={`${icon} drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]`}
  //       />
  //     </button>
  //   );
}
