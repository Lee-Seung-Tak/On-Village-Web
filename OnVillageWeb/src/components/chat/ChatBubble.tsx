// src/components/chat/ChatBubble.tsx

type Props = {
  side: "left" | "right"; // 왼쪽(공무원/시스템), 오른쪽(사용자)
  children: React.ReactNode;
};

export default function ChatBubble({ side, children }: Props) {
  const isLeft = side === "left";

  return (
    <div
      className={`w-full flex ${isLeft ? "justify-start" : "justify-end"} my-3`}
    >
      <div className="relative max-w-[70%]">
        {/* 말풍선 본체 */}
        <div
          className={`px-5 py-3 text-[15px] leading-7 rounded-2xl ${isLeft
            ? "bg-white text-[#3B3B3B] rounded-bl-sm"
            : "bg-[#89B364] text-white rounded-br-sm"
            }`}
        >
          {children}
        </div>

        {/* 꼬리 부분 */}
        {isLeft ? (
          <span className="absolute -left-2 top-3 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-[#E9E6D9]">
            <span className="absolute -top-2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white" />
          </span>
        ) : (
          <span className="absolute -right-2 top-3 w-0 h-0 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-[#89B364]" />
        )}
      </div>
    </div>
  );
}