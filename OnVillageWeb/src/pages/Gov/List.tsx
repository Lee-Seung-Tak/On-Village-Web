// src/pages/Gov/List.tsx

import { useState } from "react";
import HeaderGov from "../../components/layout/HeaderGov";
import Sidebar from "../../components/layout/Sidebar";
import MobileDrawer from "../../components/layout/MobileDrawer";

// ───────────────────────────────────────────────────────────
// 타입
type Item = {
  id: string;
  title: string;
  date: string;           // "2025.8.8" 형태
  thumbnail: string;      // 썸네일 이미지
  videoUrl?: string;      // 실제 영상 url (있으면 <video>로도 가능)
};

// ───────────────────────────────────────────────────────────
// 데스크톱 모달 + 모바일 풀화면 공용 뷰어
function ResultViewer({
  open,
  item,
  onClose,
  onEdit,
  onDownload,
}: {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  onEdit: (it: Item) => void;
  onDownload: (it: Item) => void;
}) {
  if (!open || !item) return null;

  return (
    <>
      {/* 배경 (데스크톱에서만 반투명 배경) */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 hidden md:block"
        onClick={onClose}
      />

      {/* 데스크톱: 센터 모달 */}
      <div className="hidden md:flex fixed inset-0 z-[70] items-start justify-center pt-[80px]">
        <div className="w-[640px] rounded-xl overflow-hidden bg-white shadow-xl">
          {/* 헤더 바 */}
          <div className="h-12 px-5 flex items-center justify-between border-b border-[#E9E6D9]">
            <div className="text-[14px] text-[#333]">{item.title}</div>
            <div className="text-[12px] text-[#9A9A9A]">{item.date}</div>
          </div>

          {/* 썸네일/영상 */}
          <div className="relative bg-black">
            <img src={item.thumbnail} className="w-full h-auto object-cover" />
            {/* 재생 아이콘 (시안처럼 중앙 표시) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/85 flex items-center justify-center">
                <div className="ml-1 w-0 h-0 border-t-[12px] border-b-[12px] border-l-[18px] border-t-transparent border-b-transparent border-l-[#67A462]" />
              </div>
            </div>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="h-[84px] bg-[#FFF7EA] flex items-center justify-center gap-3">
            <button
              onClick={() => onEdit(item)}
              className="h-11 px-5 rounded-full bg-[#E6E6E6] text-[#333] text-[14px] flex items-center gap-2"
            >
              <span className="inline-block w-4 h-4 border border-[#666] rounded-[2px]" />
              수정하기
            </button>
            <button
              onClick={() => onDownload(item)}
              className="h-11 px-6 rounded-full bg-[#F6A34D] text-white text-[14px] font-medium flex items-center gap-2"
            >
              다운로드
              <span className="inline-block w-4 h-4 border-b-2 border-r-2 rotate-45" />
            </button>
          </div>
        </div>

        {/* 닫기(X) */}
        <button
          onClick={onClose}
          className="absolute top-7 right-[calc(50%-340px)] w-10 h-10 rounded-full text-white"
          aria-label="닫기"
        >
          <div className="w-6 h-6 mx-auto relative">
            <span className="absolute inset-0 rotate-45 border-t-2" />
            <span className="absolute inset-0 -rotate-45 border-t-2" />
          </div>
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
            <span className="text-[11px] px-1.5 rounded-full bg-[#E5F2E8] text-[#3C8C4E]">
              공무원
            </span>
          </div>
          <div className="w-9" />
        </div>

        {/* 제목/날짜 */}
        <div className="px-4 py-3 border-b border-[#E9E6D9] bg-[#FFFDF5] flex items-center justify-between">
          <div className="text-[15px] text-[#333]">{item.title}</div>
          <div className="text-[12px] text-[#9A9A9A]">{item.date}</div>
        </div>

        {/* 미리보기 */}
        <div className="relative">
          <img src={item.thumbnail} className="w-full h-auto object-cover" />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/85 flex items-center justify-center">
              <div className="ml-1 w-0 h-0 border-t-[12px] border-b-[12px] border-l-[18px] border-t-transparent border-b-transparent border-l-[#67A462]" />
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="px-4 py-4 bg-[#FFFDF5]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(item)}
              className="flex-1 h-12 rounded-full bg-[#E6E6E6] text-[#333] text-[15px]"
            >
              수정하기
            </button>
            <button
              onClick={() => onDownload(item)}
              className="flex-1 h-12 rounded-full bg-[#F6A34D] text-white text-[15px] font-medium"
            >
              다운로드
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ───────────────────────────────────────────────────────────
// 리스트 페이지
export default function List() {
  const [drawer, setDrawer] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [open, setOpen] = useState(false);

  // 샘플 데이터 (실제에선 API 결과로 채우기)
  const items: Item[] = [
    { id: "1", title: "진도 전통 문화축제", date: "2025.8.8", thumbnail: "/images/sample1.jpg" },
    { id: "2", title: "여름 바다", date: "2025.7.2", thumbnail: "/images/sample2.jpg" },
    { id: "3", title: "캠핑", date: "2025.6.21", thumbnail: "/images/sample3.jpg" },
    { id: "4", title: "전통무용 퍼포먼스", date: "2025.6.01", thumbnail: "/images/sample4.jpg" },
    { id: "5", title: "해변 모래놀이", date: "2025.5.15", thumbnail: "/images/sample5.jpg" },
    { id: "6", title: "카약", date: "2025.5.03", thumbnail: "/images/sample6.jpg" },
    // ...더 있음
  ];

  const openViewer = (it: Item) => {
    setSelected(it);
    setOpen(true);
  };

  const closeViewer = () => setOpen(false);

  const onEdit = (it: Item) => {
    // TODO: 수정 페이지로 이동 or 챗으로 되돌려 편집
    console.log("수정하기", it.id);
  };

  const onDownload = (it: Item) => {
    // TODO: 실제 파일 다운로드 연결
    console.log("다운로드", it.id);
  };

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
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-medium text-[#333]">제작물 리스트</h2>
              <span className="text-sm text-[#888]">{items.length}개</span>
            </div>

            {/* 썸네일 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => openViewer(it)}
                  className="relative aspect-square overflow-hidden rounded-lg bg-[#EEE] shadow-sm"
                >
                  <img src={it.thumbnail} className="w-full h-full object-cover" />
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
      />
    </div>
  );
}