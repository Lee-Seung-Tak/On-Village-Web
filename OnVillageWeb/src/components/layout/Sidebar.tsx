// src/components/layout/Sidebar.tsx
import { useNavigate } from "react-router-dom";

type Props = {
  current: "chat" | "list";
};

const Item = ({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: string;
  label: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm
      ${active ? "bg-[#EAF4EE] text-[#2F6E43]" : "text-[#4A4A4A] hover:bg-[#F5F2E6]"}`}
  >
    <img src={icon} className="w-5 h-5" />
    {label}
  </button>
);

export default function Sidebar({ current }: Props) {
  const navigate = useNavigate();

  return (
    <div className="px-6 py-6">
      <Item
        active={current === "chat"}
        icon="/images/icon_chat.svg"
        label="숏폼 제작하기"
        onClick={() => navigate("/gov/chat")}
      />
      <div className="h-3" />
      <Item
        active={current === "list"}
        icon="/images/icon_list.svg"
        label="제작물 리스트"
        onClick={() => navigate("/gov/list")}
      />
    </div>
  );
}
