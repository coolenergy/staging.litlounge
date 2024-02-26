import * as hi24s from "@heroicons/react/24/solid";

function SecureSslEncryption() {
  return (
    <div className="hidden items-center gap-1 xl:flex">
      <hi24s.LockClosedIcon className="h-5 w-5 3xl:h-8 3xl:w-8" />
      <div className="flex flex-col whitespace-nowrap text-left uppercase">
        <div className="text-xs font-bold leading-none 3xl:text-sm">Secure</div>
        <div className="text-[0.5rem] leading-none 3xl:text-xs">SSL encryption</div>
      </div>
    </div>
  );
}

export default SecureSslEncryption;
