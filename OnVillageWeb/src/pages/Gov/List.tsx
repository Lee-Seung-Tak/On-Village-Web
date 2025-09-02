// src/pages/Gov/List.tsx

import { useState } from "react";
import HeaderGov from "../../components/layout/HeaderGov";
import Sidebar from "../../components/layout/Sidebar";
import MobileDrawer from "../../components/layout/MobileDrawer";
import ResultViewer from "../../components/gov/ResultViewer";
import type { GovItem as Item } from "../../types/gov";

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
                  className="relative aspect-square overflow-hidden rounded-lg bg-[#EEE]"
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
