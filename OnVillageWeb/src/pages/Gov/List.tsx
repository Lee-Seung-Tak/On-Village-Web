// src/pages/Gov/List.tsx

import { useEffect, useRef, useState } from "react";
import HeaderGov from "../../components/layout/HeaderGov";
import Sidebar from "../../components/layout/Sidebar";
import MobileDrawer from "../../components/layout/MobileDrawer";
import ResultViewer from "../../components/gov/ResultViewer";
import Toast from "../../components/common/Toast";
import type { GovItem as Item } from "../../types/gov";

// ───────────────────────────────────────────────────────────
// 리스트 페이지
export default function List() {
  const [drawer, setDrawer] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [open, setOpen] = useState(false);
  // 저장 용량/제한 (데모: 5GB 고정), 실제에선 API 응답 사용
  const limitBytes = 5 * 1024 * 1024 * 1024; // 5GB 예시
  const [sizes, setSizes] = useState<Record<string, number>>({}); // id -> bytes
  const usedBytes = Object.values(sizes).reduce((a, b) => a + b, 0);
  const usagePct = Math.min(100, limitBytes ? Math.round((usedBytes / limitBytes) * 100) : 0);
  const formatBytes = (n: number) => {
    const gb = 1024 * 1024 * 1024;
    const mb = 1024 * 1024;
    if (n >= gb) return `${(n / gb).toFixed(1)}GB`;
    if (n >= mb) return `${(n / mb).toFixed(1)}MB`;
    return `${Math.round(n / 1024)}KB`;
  };

  // 비디오 첫 프레임을 썸네일로 추출해 보여주는 컴포넌트
  function VideoThumb({ src, alt }: { src: string; alt?: string }) {
    const [thumb, setThumb] = useState<string | null>(null);
    const vRef = useRef<HTMLVideoElement | null>(null);
    useEffect(() => {
      const v = document.createElement('video');
      vRef.current = v;
      v.src = src;
      v.muted = true;
      v.preload = 'metadata';
      const gen = () => {
        try {
          const seekTo = 0.1;
          const onSeeked = () => {
            try {
              const w = v.videoWidth || 640;
              const h = v.videoHeight || 360;
              const c = document.createElement('canvas');
              c.width = w; c.height = h;
              const ctx = c.getContext('2d');
              if (ctx) {
                ctx.drawImage(v, 0, 0, w, h);
                setThumb(c.toDataURL('image/jpeg', 0.85));
              }
            } catch { }
            v.removeEventListener('seeked', onSeeked);
          };
          v.addEventListener('seeked', onSeeked);
          try { v.currentTime = seekTo; } catch { }
        } catch { }
      };
      v.addEventListener('loadedmetadata', gen);
      v.addEventListener('loadeddata', gen);
      return () => {
        v.removeEventListener('loadedmetadata', gen);
        v.removeEventListener('loadeddata', gen);
        vRef.current = null;
      };
    }, [src]);
    return (
      <img
        src={thumb ?? ''}
        alt={alt ?? ''}
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  // 샘플 데이터 (실제에선 API 결과로 채우기)
  const [items, setItems] = useState<Item[]>([
    // 데모 영상 항목 (다운로드/미리보기용)
    { id: "demo1", title: "수달이의 캠핑", date: "2025.9.1", thumbnail: "", videoUrl: "/media/demo7.mp4" },
    { id: "demo2", title: "오서산 억새밭 영상", date: "2025.9.1", thumbnail: "", videoUrl: "/media/demo1.mp4" },
    { id: "demo3", title: "할머니의 미래상상", date: "2025.9.2", thumbnail: "", videoUrl: "/media/demo2.mp4" },
    { id: "demo4", title: "할아버지의 옛날이야기", date: "2025.9.3", thumbnail: "", videoUrl: "/media/demo3.mp4" },
    { id: "demo5", title: "지역축제", date: "2025.9.4", thumbnail: "", videoUrl: "/media/demo4.mp4" },
    { id: "demo6", title: "맥주축제", date: "2025.9.5", thumbnail: "", videoUrl: "/media/demo5.mp4" },
    { id: "demo7", title: "나무아래서", date: "2025.9.6", thumbnail: "", videoUrl: "/media/demo6.mp4" },
  ]);

  const openViewer = (it: Item) => {
    setSelected(it);
    setOpen(true);
  };

  const closeViewer = () => setOpen(false);

  const onEdit = (it: Item) => {
    // TODO: 수정 페이지로 이동 or 챗으로 되돌려 편집
    console.log("수정하기", it.id);
  };

  const [toast, setToast] = useState<{ open: boolean; msg: string }>({ open: false, msg: "" });

  const onDownload = async (it: Item) => {
    if (it.videoUrl) {
      try {
        // 동일 출처 데모 파일은 fetch로 받아 Blob 다운로드 처리 → 완료 시점 제어 가능
        const res = await fetch(it.videoUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // 파일명 추정: URL 끝부분 또는 기본값
        const seg = (it.videoUrl.split('/')?.pop() || 'video.mp4').split('?')[0];
        a.download = seg || 'video.mp4';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setToast({ open: true, msg: '다운로드가 완료되었습니다.' });
      } catch (e) {
        console.error(e);
        // CORS 또는 네트워크 제한 시 기존 a.href fallback 시도
        try {
          const a = document.createElement('a');
          a.href = it.videoUrl;
          a.download = '';
          document.body.appendChild(a);
          a.click();
          a.remove();
          // 이 경로는 완료 시점을 알 수 없어 시작 안내로 대체
          setToast({ open: true, msg: '다운로드를 시작했습니다.' });
        } catch {
          setToast({ open: true, msg: '다운로드에 실패했습니다.' });
        }
      }
      return;
    }
    console.log("다운로드", it.id);
  };

  const onDelete = (it: Item) => {
    setItems(prev => prev.filter(x => x.id !== it.id));
    setSizes(prev => {
      const cp = { ...prev };
      delete cp[it.id];
      return cp;
    });
    if (selected?.id === it.id) {
      setOpen(false);
      setSelected(null);
    }
    console.log("삭제", it.id);
  };

  // 비디오 파일 크기 계산(HEAD 또는 Range)
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    const getSize = async (url: string): Promise<number | null> => {
      try {
        // 1) HEAD로 Content-Length 시도
        const r1 = await fetch(url, { method: 'HEAD', signal: controller.signal });
        const len = r1.headers.get('content-length') || r1.headers.get('Content-Length');
        if (r1.ok && len) {
          const n = parseInt(len, 10);
          if (!Number.isNaN(n) && n > 0) return n;
        }
      } catch { }
      try {
        // 2) Range GET으로 Content-Range에서 총 용량 파싱
        const r2 = await fetch(url, {
          method: 'GET',
          headers: { Range: 'bytes=0-0' },
          signal: controller.signal,
        });
        const cr = r2.headers.get('content-range') || r2.headers.get('Content-Range');
        if (cr) {
          const m = /\/(\d+)$/.exec(cr);
          if (m) {
            const n = parseInt(m[1], 10);
            if (!Number.isNaN(n) && n > 0) return n;
          }
        }
      } catch { }
      return null;
    };

    const fetchMissing = async () => {
      for (const it of items) {
        if (!it.id) continue;
        if (sizes[it.id] != null) continue;
        if (!it.videoUrl) continue;
        const n = await getSize(it.videoUrl);
        if (!alive) return;
        if (n != null) {
          setSizes(prev => ({ ...prev, [it.id]: n }));
        }
      }
    };
    fetchMissing();
    return () => { alive = false; controller.abort(); };
  }, [items, sizes]);

  return (
    <div className="h-screen flex flex-col bg-[#FAF7ED]">
      <HeaderGov onOpenMenu={() => setDrawer(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 사이드바(독립 스크롤) */}
        <aside className="hidden md:block w-[240px] border-r border-[#E9E6D9] bg-[#FFFDF5] overflow-y-auto">
          <Sidebar current="list" />
        </aside>

        {/* 콘텐츠: 독립 스크롤 */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1100px] px-4 md:px-8 py-6">
            {/* 타이틀 라인 */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[18px] font-medium text-[#333]">제작물 리스트</h2>
              <span className="text-sm text-[#888]">{items.length}개</span>
            </div>

            {/* 용량 제한 표시: 타이틀 아래, 전역 사용량/제한 */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[12px] text-[#666] select-none">용량</span>
              <div className="h-2 rounded-full bg-[#E9E6D9] w-full max-w-[320px] overflow-hidden">
                <div
                  className="h-full bg-[#3C8C4E] transition-all"
                  style={{ width: `${usagePct}%` }}
                  aria-label={`용량 사용량 ${usagePct}%`}
                  role="progressbar"
                  aria-valuenow={usagePct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <span className="text-[12px] text-[#666] whitespace-nowrap">
                {formatBytes(usedBytes)} / {formatBytes(limitBytes)}
              </span>
            </div>

            {/* 썸네일 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => openViewer(it)}
                  className="group relative overflow-hidden rounded-lg bg-[#EEE]"
                  aria-label={it.title}
                >
                  {/* Square aspect without plugin */}
                  <div className="relative w-full pt-[100%]">
                    {it.videoUrl
                      ? <VideoThumb src={it.videoUrl} alt={it.title} />
                      : <img src={it.thumbnail} className="absolute inset-0 w-full h-full object-cover" alt={it.title} />}
                  </div>

                  {/* Hover title overlay (desktop focus) */}
                  <div className="pointer-events-none absolute inset-0 flex items-end">
                    <div className="w-full px-3 pb-3 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200">
                      <div className="rounded-md bg-black/60 text-white text-[13px] md:text-[14px] font-medium px-3 py-2 text-center break-words">
                        {it.title}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      <MobileDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        onClickMenu={(k) => console.log("go", k)}
      />

      {/* 상세 뷰어 */}
      <ResultViewer
        open={open}
        item={selected}
        onClose={closeViewer}
        onEdit={onEdit}
        onDownload={onDownload}
        onDelete={onDelete}
      />

      {/* 다운로드 완료 토스트 */}
      <Toast
        open={toast.open}
        message={toast.msg}
        onClose={() => setToast({ open: false, msg: '' })}
      />
    </div>
  );
}
