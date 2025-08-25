// src/components/layout/MobileDrawer.tsx

type Props = {
  open: boolean;
  onClose: () => void;
  onClickMenu?: (key: "chat" | "list") => void;
};

export default function MobileDrawer({ open, onClose, onClickMenu }: Props) {
  return (
    <div
      className={`fixed inset-0 z-40 md:hidden transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
    >
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* 서랍 */}
      <div
        className={`absolute left-0 top-0 h-full w-[280px] bg-white rounded-tr-[28px] rounded-br-[28px] shadow-xl
          transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-5 pt-6">
          {/* 상단 로고/닫기 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/images/gov_logo.svg" className="h-6" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E5F2E8] text-[#3C8C4E]">
                공무원
              </span>
            </div>
            <button
              aria-label="닫기"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E0E0E0]"
            >
              <span className="block w-4 rotate-45 border-t border-[#3C8C4E]" />
              <span className="block w-4 -rotate-45 -mt-[2px] border-t border-[#3C8C4E]" />
            </button>
          </div>

          <div className="mt-6 border-t border-[#EFEBD9]" />

          <nav className="mt-5 space-y-2">
            <button
              onClick={() => {
                onClickMenu?.("chat");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-2 py-3 text-[#4A4A4A]"
            >
              <img src="/images/icon_chat.svg" className="w-5 h-5" />
              숏폼 제작하기
            </button>
            <button
              onClick={() => {
                onClickMenu?.("list");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-2 py-3 text-[#4A4A4A]"
            >
              <img src="/images/icon_list.svg" className="w-5 h-5" />
              제작물 리스트
            </button>
            <div className="mt-2 border-t border-[#EFEBD9]" />
            <button className="w-full flex items-center gap-3 px-2 py-3 text-[#4A4A4A]">
              <img src="/images/icon_logout.svg" className="w-5 h-5" />
              로그아웃
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}