// src/components/elder/VoiceLog.tsx

import { useVoiceWs } from "../../contexts/VoiceWsContext";

export default function VoiceLog() {
  const { log } = useVoiceWs();
  return (
    <div className="w-full max-w-lg h-64 overflow-y-auto rounded-lg bg-zinc-900 text-zinc-100 p-3 text-xs font-mono shadow">
      {log.map((l, i) => (
        <div key={i} className="opacity-90">{l}</div>
      ))}
    </div>
  );
}
