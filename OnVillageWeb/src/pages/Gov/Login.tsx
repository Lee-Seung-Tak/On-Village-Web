// src/pages/Gov/Login.tsx
import { useNavigate } from "react-router-dom";

export default function GovLogin() {
  const navigate = useNavigate();
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    // TODO: 검증 로직 추가 가능
    navigate("/gov/chat");
  };

  return (
    <section className="mx-auto flex max-w-[400px] flex-col items-center px-4 py-10 sm:px-6 md:py-25">
      <div className="flex items-center justify-center gap-2">
        <img src="/images/gov_logo.svg" alt="ON마을 공무원" className="h-10 w-auto sm:h-10" />
      </div>

      <form className="mt-8 w-full space-y-4" onSubmit={onSubmit}>
        <InputRow label="성    함" name="name" placeholder="홍길동" />
        <InputRow label="인증코드" name="code" placeholder="00325" inputMode="numeric" autoComplete="one-time-code" />
        <button
          type="submit"
          className="mt-6 h-15 w-full rounded-full bg-[#7CAB63] text-[20px] font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.99]"
        >
          로그인 하기
        </button>
      </form>
    </section>
  );
}

function InputRow({
  label, name, placeholder, inputMode, autoComplete,
}: {
  label: string; name: string; placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
}) {
  return (
    <label className="flex h-15 items-center gap-3 rounded-full bg-white px-7 py-3 shadow-sm">
      <span className="whitespace-nowrap text-[20px] font-semibold tracking-widest text-[#2F3A2F]">{label}</span>
      <span className="h-5 w-px shrink-0 bg-black/10" aria-hidden />
      <input
        name={name}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="min-w-0 flex-1 bg-transparent text-[20px] text-[#2F3A2F] placeholder:text-[#A6B5A6] outline-none"
      />
    </label>
  );
}