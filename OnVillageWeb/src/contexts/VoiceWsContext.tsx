// src/contexts/VoiceWsContext.tsx

import { createContext, useContext, type PropsWithChildren, useMemo } from "react";
import { useVoiceWebSocket, type VoiceWs, type VoiceWsOptions } from "../hooks/useVoiceWebSocket";

const Ctx = createContext<VoiceWs | null>(null);

export function VoiceWsProvider({ children, options }: PropsWithChildren<{ options?: VoiceWsOptions }>) {
  const ws = useVoiceWebSocket(options);
  const value = useMemo(() => ws, [ws]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVoiceWs(): VoiceWs {
  const v = useContext(Ctx);
  if (!v) throw new Error("VoiceWsProvider가 상위에 필요합니다.");
  return v;
}

