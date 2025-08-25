// src/components/layout/Footer.tsx
import { Link } from "react-router-dom";


export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 pb-10">
      <div className="mt-10 flex flex-col items-center gap-4 text-sm text-[#6B776B] sm:mt-12">
        <nav className="flex items-center gap-3">
          <Link to="/terms" className="underline-offset-4 hover:underline">이용약관</Link>
          <span aria-hidden>│</span>
          <Link to="/privacy" className="underline-offset-4 hover:underline">개인정보처리방침</Link>
        </nav>
        <div className="text-center leading-relaxed">
          <p>© 2025 ON마을 by 내일더함</p>
          <p>
            이메일: <a className="underline underline-offset-4" href="mailto:contact@naedam.kr">contact@naedam.kr</a>
            <span className="mx-2">│</span>
            문의: 02-1234-5678
          </p>
        </div>
      </div>
    </footer>
  );
}