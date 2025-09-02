// src/hooks/useVoiceWebSocket.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * 서버 상태 코드
 * 0: idle, 1: listening, 2: thinking, 3: speaking
 */
export type AgentStatus = 0 | 1 | 2 | 3;

export type VoiceWsOptions = {
  /** 웹소켓 주소 (예: wss://web.on-village.com/ws) */
  url?: string;
  /** 서버가 status 코드를 담아 보내는 JSON key (기본: "code") */
  statusKey?: string;
  /** 서버가 base64 오디오를 담아 보내는 JSON key (기본: "audio_base64") */
  audioKey?: string;
  /** 마이크 샘플레이트 (백엔드 16k 맞춤) */
  sampleRate?: number;
};

export type VoiceWs = {
  status: AgentStatus;
  isConnected: boolean;
  isSpeaking: boolean;
  isPushToTalk: boolean;
  log: string[];
  /** 연속(핸즈프리) 스트리밍 시작/중지 */
  startStream: () => Promise<void>;
  stopStream: () => void;
  /** 눌러서 말하기 시작/종료 */
  pushToTalkStart: () => Promise<void>;
  pushToTalkStop: () => void;
  /** 필요 시 수동 연결/해제 */
  connect: () => void;
  disconnect: () => void;
  /** 서버로 JSON 메시지 */
  sendJson: (obj: unknown) => void;
};

const defaultUrl =
  import.meta.env.VITE_WS_URL ??
  (location.protocol === "https:" ? `wss://dev.on-village.com/ws` : `ws://dev.on-village.com/ws`);

export function useVoiceWebSocket(opts?: VoiceWsOptions): VoiceWs {
  const url = opts?.url ?? defaultUrl;
  const statusKey = opts?.statusKey ?? "code";
  const audioKey = opts?.audioKey ?? "audio_base64";
  const desiredSampleRate = opts?.sampleRate ?? 16000;

  // refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | ScriptProcessorNode | null>(null);
  const pushStreamRef = useRef<MediaStream | null>(null);

  // state
  const [status, setStatus] = useState<AgentStatus>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPushToTalk, setIsPushToTalk] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const appendLog = useCallback((msg: string) => {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-400));
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      appendLog("WebSocket 연결 성공");
    };

    ws.onmessage = async (evt) => {
      try {
        let data: any;
        try {
          data = JSON.parse(evt.data);
        } catch {
          appendLog(String(evt.data));
          return;
        }

        const code: AgentStatus | undefined = data?.[statusKey];
        if (typeof code === "number") setStatus(code);

        switch (code) {
          case 0: // idle
            appendLog("상태: idle");
            break;
          case 1: // listening
            appendLog("상태: listening (마이크 수집)");
            break;
          case 2: // thinking
            appendLog("상태: thinking (전송 일시중지)");
            break;
          case 3: // speaking
            appendLog("상태: speaking (오디오 재생)");
            setIsSpeaking(true);
            if (data?.[audioKey]) {
              const b64 = data[audioKey] as string;
              const u8 = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
              const ctx = audioCtxRef.current ?? new AudioContext();
              audioCtxRef.current = ctx;
              // iOS/Safari 정책 대응: 유저 제스처 이후 resume 필요할 수 있음
              if (ctx.state === "suspended") {
                try { await ctx.resume(); } catch { }
              }
              const buffer = await ctx.decodeAudioData(u8.buffer.slice(0));
              const src = ctx.createBufferSource();
              src.buffer = buffer;
              src.connect(ctx.destination);
              src.onended = () => {
                setIsSpeaking(false);
                setStatus(0);
                appendLog("오디오 재생 완료");
              };
              src.start();
            }
            break;
          default:
            // no-op
            break;
        }
      } catch (err) {
        appendLog(`메시지 처리 오류: ${err}`);
      }
    };

    ws.onerror = (e) => {
      appendLog(`WebSocket 오류: ${JSON.stringify(e)}`);
    };

    ws.onclose = () => {
      setIsConnected(false);
      appendLog("WebSocket 종료");
      wsRef.current = null;
    };
  }, [appendLog, url, statusKey, audioKey]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const sendJson = useCallback((obj: unknown) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(obj));
  }, []);

  // 유틸
  const float32ToInt16 = useMemo(
    () => (input: Float32Array) => {
      const out = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      return out;
    },
    []
  );

  // 초기 1초 버퍼 버리기(노이즈 컷)
  const discardInitialAudio = useCallback(async (stream: MediaStream, sec = 1) => {
    const ctx = new AudioContext({ sampleRate: desiredSampleRate });
    const src = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    let elapsed = 0;
    proc.onaudioprocess = (e) => {
      elapsed += e.inputBuffer.length / ctx.sampleRate;
      if (elapsed >= sec) {
        proc.disconnect(); src.disconnect(); ctx.close();
      }
    };
    src.connect(proc); proc.connect(ctx.destination);
    await new Promise((r) => setTimeout(r, sec * 1000));
  }, [desiredSampleRate]);

  // 연속 스트리밍
  const startStream = useCallback(async () => {
    connect();
    // 연결이 아직 열리지 않았더라도 마이크 준비만 먼저
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: desiredSampleRate,
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    micStreamRef.current = stream;

    await discardInitialAudio(stream, 1);

    const ctx = new AudioContext({ sampleRate: desiredSampleRate });
    audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);

    sourceNodeRef.current = src;
    processorRef.current = proc;

    src.connect(proc);
    proc.connect(ctx.destination);

    proc.onaudioprocess = (e) => {
      if (isSpeaking) return;
      if (status === 2) return; // thinking 중에는 전송 안 함
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const f32 = e.inputBuffer.getChannelData(0);
      const i16 = float32ToInt16(f32);
      ws.send(i16.buffer);
    };

    appendLog("마이크 스트리밍 시작");
  }, [appendLog, connect, desiredSampleRate, discardInitialAudio, float32ToInt16, isSpeaking, status]);

  const stopStream = useCallback(() => {
    processorRef.current?.disconnect(); processorRef.current = null;
    sourceNodeRef.current?.disconnect(); sourceNodeRef.current = null;
    audioCtxRef.current?.close(); audioCtxRef.current = null;
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    appendLog("마이크 스트리밍 중지");
  }, [appendLog]);

  // 눌러서 말하기
  const pushToTalkStart = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      appendLog("WebSocket 연결 필요");
      connect();
      // 연결 열릴 때까지 기다릴 여유가 없으면 바로 return 해도 됨
    }
    sendJson({ event: "press_to_push" });
    appendLog("눌러서 말하기 시작");

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: desiredSampleRate,
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    pushStreamRef.current = stream;

    const ctx = new AudioContext({ sampleRate: desiredSampleRate });
    audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);

    sourceNodeRef.current = src;
    processorRef.current = proc;

    src.connect(proc);
    proc.connect(ctx.destination);

    proc.onaudioprocess = (e) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const f32 = e.inputBuffer.getChannelData(0);
      const i16 = float32ToInt16(f32);
      ws.send(i16.buffer);
    };

    setIsPushToTalk(true);
  }, [appendLog, connect, desiredSampleRate, float32ToInt16, sendJson]);

  const pushToTalkStop = useCallback(() => {
    if (!isPushToTalk) return;
    processorRef.current?.disconnect(); processorRef.current = null;
    sourceNodeRef.current?.disconnect(); sourceNodeRef.current = null;
    audioCtxRef.current?.close(); audioCtxRef.current = null;
    pushStreamRef.current?.getTracks().forEach((t) => t.stop());
    pushStreamRef.current = null;
    setIsPushToTalk(false);
    appendLog("눌러서 말하기 종료");
  }, [appendLog, isPushToTalk]);

  // 언마운트 정리
  useEffect(() => {
    return () => {
      stopStream();
      pushToTalkStop();
      disconnect();
    };
  }, [stopStream, pushToTalkStop, disconnect]);

  return {
    status,
    isConnected,
    isSpeaking,
    isPushToTalk,
    log,
    startStream,
    stopStream,
    pushToTalkStart,
    pushToTalkStop,
    connect,
    disconnect,
    sendJson,
  };
}
