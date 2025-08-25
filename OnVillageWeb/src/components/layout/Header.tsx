// src/components/layout/Header.tsx

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "공무원 대화" }: HeaderProps) {
  return (
    <header className="h-14 shrink-0 border-b border-gray-200 bg-white">
      <div className="h-full max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/images/gov_logo.svg" alt="gov logo" className="w-7 h-7" />
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <img src="/images/icon_user.svg" alt="user" className="w-5 h-5" />
          <span className="hidden sm:inline">로그아웃</span>
        </button>
      </div>
    </header>
  );
}