// PaginatedVoiceBubble.tsx
// 말풍선 내부 텍스트가 화면을 넘어가면 자동으로 다음 "페이지(버블)"로 넘어가도록 분할 렌더링합니다.

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import VoiceBubble from "./VoiceBubble";

type Props = {
  role: "agent" | "user";
  text: string | undefined | null;
  className?: string;
  // 선택: 버블이 차지할 최대 높이 비율 (viewport 기준). 기본 0.34 (34vh)
  maxVhRatio?: number;
  // 버블 내부 상단에 표시할 요소(예: 복약 알림 뱃지)
  header?: React.ReactNode;
};

// 공백/줄바꿈을 유지하며 단어 기준으로 쪼개기
function tokenize(text: string) {
  // 공백(스페이스/탭/줄바꿈)을 토큰으로 유지
  const tokens: string[] = [];
  let buf = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch.match(/[\s]/)) {
      if (buf) {
        tokens.push(buf);
        buf = "";
      }
      tokens.push(ch);
    } else {
      buf += ch;
    }
  }
  if (buf) tokens.push(buf);
  return tokens;
}

export default function PaginatedVoiceBubble({ role, text, className, maxVhRatio = 0.34, header }: Props) {
  const fullText = (text ?? "").toString();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const headerMeasureRef = useRef<HTMLDivElement | null>(null);

  // 페이지 분할 결과
  const [pages, setPages] = useState<string[]>([fullText]);
  const [pageIndex, setPageIndex] = useState(0);

  // 뷰포트/컨테이너 변경 감지 (리사이즈 시 재계산)
  useEffect(() => {
    function onResize() {
      // 트리거만; 실제 계산은 아래 useLayoutEffect에서 수행
      setPages((p) => [...p]);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 텍스트가 늘어날 때는 자동으로 가장 마지막 페이지를 보여주도록 유지
  useEffect(() => {
    setPageIndex((i) => (i >= pages.length - 1 ? pages.length - 1 : i));
  }, [pages.length]);

  // fullText 변화 시 페이지 분할 수행
  useLayoutEffect(() => {
    const el = measureRef.current;
    const host = containerRef.current;
    if (!el || !host) {
      setPages([fullText]);
      setPageIndex(0);
      return;
    }

    // 버블이 차지할 수 있는 최대 높이 (약간 보수적으로 0.96 배)
    const maxHeight = Math.max(140, Math.floor(window.innerHeight * maxVhRatio)) * 0.96;

    // 헤더 높이(뱃지 등)를 측정하여 가용 높이에서 제외
    const headerHeight = headerMeasureRef.current?.offsetHeight ?? 0;
    const contentMaxHeight = Math.max(80, maxHeight - headerHeight);

    // 측정기 초기화: 동일한 텍스트 스타일을 적용하여 실제 줄바꿈/높이를 계산
    // 스타일은 VoiceBubble 내부 텍스트와 맞춰야 함
    // 실제 표시 영역은 말풍선 패딩만큼 좁아지므로 보정
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    const horizontalPadding = isDesktop ? 56 /* px-7 * 2 */ : 48 /* px-6 * 2 */;
    const measureWidth = Math.max(120, host.clientWidth - horizontalPadding);
    el.style.width = `${measureWidth}px`;
    el.style.position = "absolute";
    el.style.visibility = "hidden";
    el.style.pointerEvents = "none";
    el.style.whiteSpace = "pre-wrap";
    el.style.lineHeight = "1.5";
    el.style.fontWeight = "600";
    // VoiceBubble와 동일한 폰트 사이즈 (모바일/데스크탑 차이를 보정하기 위해 중간값 사용)
    const fz = isDesktop ? 26 : 25;
    el.style.fontSize = `${fz}px`;
    el.style.padding = "0px"; // 측정은 내용만
    el.style.boxSizing = "border-box";
    el.style.maxHeight = `${contentMaxHeight}px`;
    el.style.overflow = "hidden";

    // 토큰 단위로 페이지를 만들어감
    const tokens = tokenize(fullText);
    const result: string[] = [];
    let cur = "";

    const flush = () => {
      const trimmed = cur.replace(/\s+$/, "");
      result.push(trimmed);
      cur = "";
    };

    for (let i = 0; i < tokens.length; i++) {
      const next = cur + tokens[i];
      el.textContent = next.length ? next : " ";
      // scrollHeight가 clientHeight보다 크면 넘침
      const isOverflow = el.scrollHeight > contentMaxHeight;
      if (isOverflow) {
        if (cur.length === 0) {
          // 단일 토큰도 넘치는 극단 케이스: 강제로 자르기
          el.textContent = tokens[i];
          // 이 경우 적당히 문자 단위로 줄이기
          let piece = tokens[i];
          while (piece.length > 1) {
            piece = piece.slice(0, piece.length - 1);
            el.textContent = piece;
            if (el.scrollHeight <= contentMaxHeight) break;
          }
          cur = piece;
        }
        flush();
        // 남은 토큰 재시도
        i--; // 현재 토큰 다시 처리
        continue;
      } else {
        cur = next;
      }
    }
    if (cur.trim().length) flush();

    const safePages = result.length ? result : [fullText];

    // 페이지 수가 늘었으면 최신 페이지로 이동해 자연스러운 "다음 버블" 효과
    const increased = safePages.length > pages.length;
    setPages(safePages);
    setPageIndex((prev) => (increased ? safePages.length - 1 : Math.min(prev, safePages.length - 1)));
  }, [fullText, maxVhRatio]);

  // 현재 페이지 텍스트
  const visible = useMemo(() => {
    if (!pages.length) return fullText;
    const idx = Math.max(0, Math.min(pageIndex, pages.length - 1));
    return pages[idx];
  }, [pages, pageIndex, fullText]);

  // 페이지 인디케이터 (선택)
  const indicator = pages.length > 1 ? `${pageIndex + 1}/${pages.length}` : undefined;

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      {/* 측정용 히든 엘리먼트 */}
      <div ref={measureRef} aria-hidden className="fixed -z-10 left-[-9999px] top-[-9999px]" />

      {/* 헤더 측정용 히든 */}
      <div ref={headerMeasureRef} aria-hidden className="fixed -z-10 left-[-9999px] top-[-9999px]">
        {header}
      </div>

      <VoiceBubble role={role} className={className}>
        <div className="relative">
          {header ? <div className="mb-2">{header}</div> : null}
          {/* 실제 표시 텍스트 */}
          <p className="whitespace-pre-line">{visible}</p>
          {indicator ? (
            <span className="absolute -bottom-2 right-0 translate-y-full text-[12px] text-[#8c8c8c] select-none">
              {indicator}
            </span>
          ) : null}
        </div>
      </VoiceBubble>
    </div>
  );
}
