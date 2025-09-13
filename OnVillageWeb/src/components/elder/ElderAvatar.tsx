// src/components/elder/ElderAvatar.tsx

export type Mood = "idle" | "listening" | "tinking" | "speaking" | "alert";

const IMG: Record<Mood, string> = {
  speaking: "/images/woman_1.png",
  listening: "/images/woman_2.png",
  idle: "/images/woman_2.png",
  tinking: "/images/woman_3.png",
  alert: "/images/woman_4.png",
};

export default function ElderAvatar({
  mood = "idle",
  className = "",
}: {
  mood?: Mood;
  className?: string;
}) {
  const src = IMG[mood];
  const alt =
    mood === "speaking"
      ? "말하는 캐릭터"
      : mood === "listening"
        ? "듣는 캐릭터"
        : mood === "tinking"
          ? "생각하는 캐릭터"
          : mood === "alert"
            ? "긴급 상황 캐릭터"
            : "기본 캐릭터";

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={`select-none pointer-events-none ${className}`}
    />
  );
}
