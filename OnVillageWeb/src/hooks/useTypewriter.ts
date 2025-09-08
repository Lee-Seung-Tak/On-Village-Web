// src/hooks/useTypewriter.ts

import { useEffect, useRef, useState } from "react";

export type TypewriterOptions = {
  /** milliseconds per character (default: 20ms) */
  speed?: number;
  /** if true, start already completed */
  instant?: boolean;
};

export function useTypewriter(text: string, opts?: TypewriterOptions) {
  const speed = Math.max(1, opts?.speed ?? 20);
  const instant = opts?.instant ?? false;

  const [output, setOutput] = useState<string>(instant ? text : "");
  const [done, setDone] = useState<boolean>(instant);
  const idxRef = useRef<number>(instant ? text.length : 0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // reset on new text
    setDone(instant);
    setOutput(instant ? text : "");
    idxRef.current = instant ? text.length : 0;

    if (instant) return;

    // type with fixed interval for performance predictability
    timerRef.current && window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      const i = idxRef.current + 1;
      if (i >= text.length) {
        setOutput(text);
        setDone(true);
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
        idxRef.current = text.length;
      } else {
        idxRef.current = i;
        setOutput(text.slice(0, i));
      }
    }, speed);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [text, speed, instant]);

  return { text: output, done } as const;
}

