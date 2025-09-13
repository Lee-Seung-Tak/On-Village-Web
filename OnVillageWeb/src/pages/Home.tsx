// src/pages/Home.tsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-screen-xl flex-col px-4 pb-24 pt-13 sm:px-6 lg:px-8">

      {/* 헤더 로고 (SVG 파일) */}
      <header className="mt-6 flex flex-col items-center text-center">
        {/* public/images/logo.svg 기준 */}
        <img
          src="/images/on_logo.svg"
          alt="ON마을"
          className="h-18 w-auto sm:h-20"
          decoding="async"
        />

        <p className="mt-4 text-base text-[18px] sm:text-[25px] font-semibold text-[#3F6248]">AI로 어르신 말벗부터</p>
        <p className="text-base text-[18px] sm:text-[25px] font-semibold text-[#3F6248]">지역 정책 홍보·피드백까지 한 번에!</p>
      </header>

      {/* 서비스 카드 (모바일 1열 → md 2열) */}
      <section className="mx-auto mt-8 grid w-full max-w-[860px] grid-cols-1 gap-4 sm:mt-10 md:grid-cols-2 md:gap-6">
        {/* 공무원 카드 */}
        <Link
          to="/gov"
          aria-label="지자체 홍보 제작 서비스 (공무원)"
          className="relative block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {/* 카드 배경/버튼/아이콘이 포함된 SVG 이미지 */}
          <img
            src="/images/gov_bg_btn.svg"
            alt=""
            className="h-auto w-full rounded-[22px]
               transition-[filter] duration-300 ease-out
               group-hover:drop-shadow-[0_5px_5px_rgba(0,0,0,0.10)]
               group-hover:brightness-105"
            decoding="async"
          />
          {/* 비율 고정(옵션) */}
          <div className="pointer-events-none absolute inset-0">
            <div className="relative h-full w-full">
              {/* 텍스트 배치 */}
              <div
                className="absolute font-nsr text-white"
                style={{
                  top: "12%",
                  left: "6%",
                }}
              >
                <h3 className="text-[25px] font-semibold sm:text-[25px]">
                  지자체 홍보 제작 서비스
                </h3>
                <p className="mt-1 text-[25px] sm:text-[25px]">(공무원)</p>
              </div>
            </div>
          </div>
        </Link>

        {/* 어르신 카드 */}
        <Link
          to="/elder"
          aria-label="어르신 말벗 서비스 (어르신)"
          className="relative block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <img
            src="/images/eld_bg_btn.svg"
            alt=""
            className="h-auto w-full rounded-[22px]
               transition-[filter] duration-300 ease-out
               group-hover:drop-shadow-[0_5px_5px_rgba(0,0,0,0.10)]
               group-hover:brightness-105"
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-0">
            <div className="relative h-full w-full">
              <div
                className="absolute font-nsr text-white"
                style={{
                  top: "12%",
                  left: "6%",
                }}
              >
                <h3 className="text-[25px] font-semibold sm:text-[25px]">
                  어르신 말벗 서비스
                </h3>
                <p className="mt-1 text-[25px] sm:text-[25px]">(어르신)</p>
              </div>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
