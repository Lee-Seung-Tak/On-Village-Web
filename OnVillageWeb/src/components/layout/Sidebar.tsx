// src/components/layout/Sidebar.tsx

type Props = {
  current: "chat" | "list";
  onClickMenu?: (key: "chat" | "list") => void;
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

export default function Sidebar({ current, onClickMenu }: Props) {
  return (
    <aside className="hidden md:block w-[240px] border-r border-[#E9E6D9] bg-[#FFFDF5]">
      <div className="px-6 py-6">
        <Item
          active={current === "chat"}
          icon="/images/icon_chat.svg"
          label="숏폼 제작하기"
          onClick={() => onClickMenu?.("chat")}
        />
        <div className="h-3" />
        <Item
          active={current === "list"}
          icon="/images/icon_list.svg"
          label="제작물 리스트"
          onClick={() => onClickMenu?.("list")}
        />
      </div>
    </aside>
  );
}