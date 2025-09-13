// src/contexts/VoiceWsContext.tsx

import { createContext, useContext, type PropsWithChildren, useMemo } from "react";
import { useVoiceWebSocket, type VoiceWs, type VoiceWsOptions } from "../hooks/useVoiceWebSocket";
import { useVoiceWebSocketDemo } from "../hooks/useVoiceWebSocketDemo";

const Ctx = createContext<VoiceWs | null>(null);

export function VoiceWsProvider({ children, options }: PropsWithChildren<{ options?: VoiceWsOptions }>) {
  // 데모 모드: options.url === 'demo' 인 경우 실제 WS 대신 시뮬레이터 사용
  const ws = options?.url === 'demo'
    ? useVoiceWebSocketDemo(options)
    : useVoiceWebSocket(options);
  const value = useMemo(() => ws, [ws]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVoiceWs(): VoiceWs {
  const v = useContext(Ctx);
  if (!v) throw new Error("VoiceWsProvider가 상위에 필요합니다.");
  return v;
}
