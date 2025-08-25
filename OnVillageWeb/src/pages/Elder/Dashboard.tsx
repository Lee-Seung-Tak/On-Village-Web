// src/pages/Elder/Dashboard.tsx

export default function ElderDashboard() {
  return (
    <section className="mx-auto w-full max-w-screen-md px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold text-[#3E5946]">어르신 돌봄 서비스</h2>
      <p className="mt-2 text-[#506b58]">간단히 인사하고, 마이크 버튼으로 대화를 시작하세요.</p>
      <div className="mt-8 flex items-center justify-center">
        <button className="h-20 w-20 rounded-full bg-[#F4A241] text-white shadow-md transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2">
          🎤
        </button>
      </div>
    </section>
  );
}