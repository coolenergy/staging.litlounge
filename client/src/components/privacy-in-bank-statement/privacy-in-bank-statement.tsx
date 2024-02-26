import * as hi24s from "@heroicons/react/24/solid";

function PrivacyInBankStatement() {
  return (
    <div className="hidden items-center gap-1 xl:flex">
      <hi24s.ShieldCheckIcon className="h-5 w-5 3xl:h-8 3xl:w-8" />
      <div className="flex flex-col whitespace-nowrap text-left uppercase">
        <div className="text-xs font-bold leading-none 3xl:text-sm">Privacy</div>
        <div className="text-[0.5rem] leading-none 3xl:text-xs">in bank statement</div>
      </div>
    </div>
  );
}

export default PrivacyInBankStatement;
