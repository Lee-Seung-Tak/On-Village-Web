// src/pages/Gov/Dashboard.tsx

export default function GovDashboard() {
  return (
    <section className="mx-auto w-full max-w-screen-lg px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold text-[#3E5946]">지자체 홍보 제작 서비스</h2>
      <p className="mt-2 text-[#506b58]">챗봇에 필요한 정보를 입력하면 숏폼 초안이 생성됩니다.</p>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white/80 p-4 shadow-sm">
          <label className="block text-sm text-[#586b5d]">축제/행사명</label>
          <input className="mt-1 w-full rounded-lg border border-[#d9e2d9] bg-white px-3 py-2 outline-none focus:ring" placeholder="예) 단양 마늘축제" />
        </div>
        <div className="rounded-xl bg-white/80 p-4 shadow-sm">
          <label className="block text-sm text-[#586b5d]">지역/장소</label>
          <input className="mt-1 w-full rounded-lg border border-[#d9e2d9] bg-white px-3 py-2 outline-none focus:ring" placeholder="예) 충북 단양" />
        </div>
      </div>
      <button className="mt-6 rounded-xl bg-[#7CAB63] px-5 py-3 font-medium text-white shadow-sm hover:brightness-95">초안 생성</button>
    </section>
  );
}