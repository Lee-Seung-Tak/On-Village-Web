// MicButton.tsx

type Props = { listening: boolean; onClick: () => void };

export default function MicButton({ listening, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`mx-auto mt-6 md:mt-8 w-[112px] h-[112px] md:w-[128px] md:h-[128px]
        rounded-full shadow-[0_8px_0_rgba(0,0,0,0.08)] flex items-center justify-center
        ${listening ? "bg-[#FFE1BF]" : "bg-[#F6A34D]"}`}
      aria-pressed={listening}
      aria-label={listening ? "듣는 중" : "말하기"}
    >
      {listening ? (
        <div className="flex items-end gap-1.5">
          {[10, 18, 28, 18, 10].map((h, i) => (
            <span
              key={i}
              className="w-2 rounded-sm bg-[#F6A34D] animate-pulse"
              style={{ height: h }}
            />
          ))}
        </div>
      ) : (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
          <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3z" />
          <path d="M5 11a7 7 0 0 0 14 0" stroke="white" strokeWidth="2" fill="none" />
          <path d="M12 18v3" stroke="white" strokeWidth="2" />
        </svg>
      )}
    </button>
  );
}
