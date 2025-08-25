// src/components/chat/ChatInput.tsx

export default function ChatInput() {
  return (
    <div className="sticky bottom-0 z-10 w-full bg-[#F7F3E6]/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
      <div className="mx-auto w-full max-w-screen-md px-4 py-4">
        <label className="flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-sm">
          <input
            placeholder="제작하고 싶은 홍보물 내용을 입력하세요"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#A6B5A6]"
          />
          <button
            type="button"
            aria-label="보내기"
            className="grid h-9 w-9 place-content-center rounded-full bg-[#DADFDA] text-[#2F3A2F] hover:brightness-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </label>
      </div>
    </div>
  );
}