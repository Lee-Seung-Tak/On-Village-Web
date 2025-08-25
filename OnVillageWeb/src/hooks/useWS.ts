import { useEffect, useRef, useState } from "react";
import { buildWsUrl } from "../lib/wsEndpoint";

type WSStatus = "idle" | "connecting" | "open" | "closed" | "error";
const BACKOFFS = [500, 1000, 2000, 5000, 10000];

export function useWS() {
  const [status, setStatus] = useState<WSStatus>("idle");
  const [messages, setMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const hbRef = useRef<number | null>(null);
  const retry = useRef(0);
  const manualClose = useRef(false);

  const connect = () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) return;

    setStatus("connecting");
    const ws = new WebSocket(buildWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("open");
      retry.current = 0;
      if (hbRef.current) window.clearInterval(hbRef.current);
      hbRef.current = window.setInterval(() => {
        try { ws.send(JSON.stringify({ type: "ping" })); } catch { }
      }, 25_000) as unknown as number;
    };

    ws.onmessage = (e) => {
      try { setMessages((prev) => [...prev, JSON.parse(e.data)]); }
      catch { /* 필요시 텍스트/바이너리 처리 */ }
    };

    ws.onerror = () => setStatus("error");

    ws.onclose = () => {
      setStatus("closed");
      if (hbRef.current) { window.clearInterval(hbRef.current); hbRef.current = null; }
      wsRef.current = null;
      if (!manualClose.current) {
        const delay = BACKOFFS[Math.min(retry.current, BACKOFFS.length - 1)];
        retry.current += 1;
        setTimeout(connect, delay);
      }
    };
  };

  useEffect(() => {
    manualClose.current = false;
    connect();

    const onVis = () => {
      if (document.visibilityState === "visible" && wsRef.current?.readyState !== WebSocket.OPEN) connect();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      manualClose.current = true;
      if (hbRef.current) { window.clearInterval(hbRef.current); hbRef.current = null; }
      wsRef.current?.close();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const send = (payload: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      return true;
    }
    return false;
  };

  return { status, messages, send };
}