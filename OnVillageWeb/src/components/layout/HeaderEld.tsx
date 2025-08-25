export default function HeaderEld() {
  return (
    <header className="h-14 md:h-16 w-full border-b border-[#E9E6D9] bg-[#FFFDF5]">
      <div className="mx-auto max-w-[1200px] h-full flex items-center justify-center md:justify-start px-4 md:px-6">
        <div className="flex items-center gap-2">
          <img src="/images/eld_logo.svg" alt="ON마을어르신" className="h-6 md:h-7" />
        </div>
      </div>
    </header>
  );
}