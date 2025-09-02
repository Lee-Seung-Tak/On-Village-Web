// src/components/gov/ResultViewer.tsx
import type { GovItem as Item } from "../../types/gov";

type Props = {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  onEdit: (it: Item) => void;
  onDownload: (it: Item) => void;
};

export default function ResultViewer({ open, item, onClose, onEdit, onDownload }: Props) {
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
              className="h-11 px-5 rounded-full bg-[#E6E6E6] text-[#333] text-[16px] font-semibold flex items-center gap-2"
            >
              수정하기
              <img src="/images/icon_edit.svg" alt="수정하기" className="w-7 h-7" />
            </button>
            <button
              onClick={() => onDownload(item)}
              className="h-11 px-6 rounded-full bg-[#F6A34D] text-white text-[16px] font-semibold flex items-center gap-2"
            >
              다운로드
              <img src="/images/icon_down.svg" alt="다운로드" className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* 닫기(X) */}
        <button
          onClick={onClose}
          className="absolute top-7 right-[calc(50%-340px)] w-10 h-10 rounded-full text-white"
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
          <div className="h-[84px] flex items-center justify-center gap-3">
            <button
              onClick={() => onEdit(item)}
              className="h-14 px-8 rounded-full bg-[#E6E6E6] text-[#333] text-[16px] font-semibold flex items-center gap-2"
            >
              수정하기
              <img src="/images/icon_edit.svg" alt="수정하기" className="w-7 h-7" />
            </button>
            <button
              onClick={() => onDownload(item)}
              className="h-14 px-8 rounded-full bg-[#F6A34D] text-white text-[16px] font-semibold flex items-center gap-2"
            >
              다운로드
              <img src="/images/icon_down.svg" alt="다운로드" className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
