// src/components/gov/ResultViewer.tsx
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { GovItem as Item } from "../../types/gov";

type Props = {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  onEdit: (it: Item) => void;
  onDownload: (it: Item) => void;
  onDelete: (it: Item) => void;
};

// 내부: 동영상 첫 프레임을 캡처해 poster로 사용
function AutoPosterVideo({ src, className = "", style }: { src: string; className?: string; style?: CSSProperties }) {
  const vRef = useRef<HTMLVideoElement | null>(null);
  const [poster, setPoster] = useState<string | undefined>();
  useEffect(() => {
    const v = vRef.current;
    if (!v) return;
    const gen = () => {
      try {
        const seekTo = Math.min(0.15, (v.duration || 1) * 0.05);
        const onSeeked = () => {
          try {
            const w = v.videoWidth || 640;
            const h = v.videoHeight || 360;
            const c = document.createElement("canvas");
            c.width = w; c.height = h;
            const ctx = c.getContext("2d");
            if (ctx) {
              ctx.drawImage(v, 0, 0, w, h);
              setPoster(c.toDataURL("image/jpeg", 0.85));
            }
          } catch { }
          v.removeEventListener("seeked", onSeeked);
        };
        v.addEventListener("seeked", onSeeked);
        try { v.currentTime = seekTo; } catch { }
      } catch { }
    };
    v.addEventListener("loadedmetadata", gen);
    v.addEventListener("loadeddata", gen);
    return () => {
      v.removeEventListener("loadedmetadata", gen);
      v.removeEventListener("loadeddata", gen);
    };
  }, [src]);
  return (
    <video
      ref={vRef}
      className={className}
      src={src}
      controls
      playsInline
      preload="metadata"
      poster={poster}
      style={style}
    />
  );
}

export default function ResultViewer({ open, item, onClose, onEdit, onDownload, onDelete }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  if (!open || !item) return null;

  return (
    <>
      {/* 삭제 확인 모달 */}
      <ConfirmModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => { setConfirmOpen(false); onDelete(item); }}
      />
      {/* 배경 (데스크톱에서만 반투명 배경) */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 hidden md:block"
        onClick={onClose}
      />

      {/* 데스크톱: 센터 모달 */}
      <div className="hidden md:flex fixed inset-0 z-[70] items-start justify-center pt-[48px]">
        <div className="w-[680px] max-h-[calc(100vh-64px)] rounded-xl overflow-hidden bg-white shadow-xl flex flex-col">
          {/* 헤더 바 */}
          <div className="h-12 px-5 flex items-center justify-between border-b border-[#E9E6D9]">
            <div className="text-[14px] text-[#333]">{item.title}</div>
            <div className="text-[12px] text-[#9A9A9A]">{item.date}</div>
          </div>

          {/* 영상: 첫 프레임을 poster로 표시, 컨트롤로 재생 (뷰포트 높이에 맞춰 축소) */}
          <div className="relative bg-black flex justify-center py-3">
            {item.videoUrl ? (
              <AutoPosterVideo
                src={item.videoUrl}
                className="w-full max-w-[680px] rounded-md"
                style={{ maxHeight: 'calc(100vh - 220px)' }}
              />
            ) : (
              <img src={item.thumbnail} className="w-full h-auto object-cover" />
            )}
          </div>

          {/* 하단 버튼 영역 */}
          <div className="h-[84px] bg-[#FFF7EA] flex items-center justify-center gap-3">
            {/* <button
              onClick={() => onEdit(item)}
              className="h-11 px-5 rounded-full bg-[#E6E6E6] text-[#333] text-[16px] font-semibold flex items-center gap-2"
            >
              수정하기
              <img src="/images/icon_edit.svg" alt="수정하기" className="w-7 h-7" />
            </button> */}
            <button
              onClick={() => onDownload(item)}
              className="h-11 px-6 rounded-full bg-[#F6A34D] text-white text-[16px] font-semibold flex items-center gap-2"
            >
              다운로드
              <img src="/images/icon_down.svg" alt="다운로드" className="w-7 h-7" />
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className="h-11 px-6 rounded-full bg-[#E35B5B] text-white text-[16px] font-semibold flex items-center gap-2"
            >
              삭제
              <img src="/images/icon_close.svg" alt="삭제" className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* 닫기(X) */}
        <button
          onClick={onClose}
          className="absolute top-7 right-[calc(50%-380px)] w-10 h-10 rounded-full text-white"
          aria-label="닫기"
        >
          <img src="/images/icon_close.svg" alt="닫기" className="w-10 h-10 mx-auto" />
        </button>
      </div>

      {/* 모바일: 풀스크린 디테일 */}
      <div className="md:hidden fixed inset-0 z-[70] flex flex-col bg-[#FAF7ED]">
        {/* 톱바 */}
        <div className="h-14 border-b border-[#E9E6D9] bg-[#FFFDF5] flex items-center px-3">
          <button
            onClick={onClose}
            aria-label="뒤로가기"
            className="mr-1 w-9 h-9 flex items-center justify-center"
          >
            <span className="w-2 h-2 -rotate-45 border-l-2 border-b-2 border-[#3C8C4E]" />
          </button>
          <div className="flex-1 flex items-center justify-center gap-2">
            <img src="/images/gov_logo.svg" className="h-5" />
          </div>
          <div className="w-9" />
        </div>

        {/* 제목/날짜 */}
        <div className="px-4 py-3 border-b border-[#E9E6D9] bg-[#FFFDF5] flex items-center justify-between">
          <div className="text-[15px] text-[#333]">{item.title}</div>
          <div className="text-[12px] text-[#9A9A9A]">{item.date}</div>
        </div>

        {/* 미리보기: 모바일도 영상 첫 프레임을 표시 (높이 제한) */}
        <div className="relative p-3 bg-black flex justify-center">
          {item.videoUrl ? (
            <AutoPosterVideo
              src={item.videoUrl}
              className="w-full max-w-[720px] rounded-md border border-[#EFEDE4]"
              style={{ maxHeight: 'calc(100vh - 240px)' }}
            />
          ) : (
            <img src={item.thumbnail} className="w-full h-auto object-cover" />
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="px-4 py-4 bg-[#FFFDF5]">
          <div className="h-[84px] flex items-center justify-center gap-3">
            {/* <button
              onClick={() => onEdit(item)}
              className="h-14 px-8 rounded-full bg-[#E6E6E6] text-[#333] text-[16px] font-semibold flex items-center gap-2"
            >
              수정하기
              <img src="/images/icon_edit.svg" alt="수정하기" className="w-7 h-7" />
            </button> */}
            <button
              onClick={() => onDownload(item)}
              className="h-14 px-8 rounded-full bg-[#F6A34D] text-white text-[16px] font-semibold flex items-center gap-2"
            >
              다운로드
              <img src="/images/icon_down.svg" alt="다운로드" className="w-7 h-7" />
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className="h-14 px-8 rounded-full bg-[#E35B5B] text-white text-[16px] font-semibold flex items-center gap-2"
            >
              삭제
              <img src="/images/icon_close.svg" alt="삭제" className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// 간단한 확인 모달
function ConfirmModal({ open, onCancel, onConfirm, title, message }: { open: boolean; onCancel: () => void; onConfirm: () => void; title?: string; message?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-[90%] max-w-[360px] bg-white rounded-xl shadow-lg p-5">
        <div className="text-[16px] font-semibold text-[#333] mb-2">{title ?? "정말로 삭제하시겠습니까?"}</div>
        <div className="text-[14px] text-[#666] mb-4">{message ?? "삭제 후에는 복구할 수 없습니다."}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="h-10 px-4 rounded-full bg-[#E6E6E6] text-[#333] text-[14px] font-medium">취소</button>
          <button onClick={onConfirm} className="h-10 px-5 rounded-full bg-[#E35B5B] text-white text-[14px] font-semibold">삭제</button>
        </div>
      </div>
    </div>
  );
}
