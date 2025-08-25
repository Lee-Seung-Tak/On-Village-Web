// src/components/chat/ChatBubble.tsx

type Props = {
  side: "left" | "right"; // left=bot, right=user
  children: React.ReactNode;
  className?: string;
};

export default function ChatBubble({ side, children, className = "" }: Props) {
  const isRight = side === "right";
  const bg = isRight ? "bg-[#7CAB63] text-white" : "bg-white text-[#2F3A2F]";
  const tailBg = isRight ? "bg-[#7CAB63]" : "bg-white";

  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div className={`relative inline-block max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${bg} ${className}`}>
        {children}
        {/* 꼬리 */}
        <span
          aria-hidden
          className={`absolute top-3 ${isRight ? "-right-1" : "-left-1"} h-3 w-3 rotate-45 ${tailBg}`}
        />
      </div>
    </div>
  );
}