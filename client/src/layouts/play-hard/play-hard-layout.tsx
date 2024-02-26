import { clsx } from "clsx";
import Link from "next/link";
import { ReactNode } from "react";
import { localStorageHooks } from "~/hooks/local-storage-hooks";
import { paths } from "~/utils/paths";

function Button({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        className,
        "focus-visible:use-outline",
        "inline-flex justify-center",
        "w-full xl:w-auto",
        "px-6 py-2",
        "rounded-40 xl:rounded-10",
        "text-sm xl:text-sm 3xl:text-base"
      )}
    >
      {children}
    </button>
  );
}

function AgreementPanel() {
  const [isAgreed, storeIsAgreed] = localStorageHooks.useIsAgreed();
  return (
    <div
      className={clsx(
        "w-full rounded-40 p-8 xl:rounded-10",
        "bg-my-light dark:bg-my-dark xl:bg-white",
        isAgreed === false ? "block" : "hidden"
      )}
    >
      <p
        className={clsx(
          "text-center",
          "text-[#242424] dark:text-[#cbcbcb] xl:text-black xl:dark:text-white",
          "xl:text-lg 3xl:text-xl"
        )}
      >
        I agree that I am 18+ and have read and agree to <br className="hidden xl:block" />
        the{" "}
        <Link href={paths.termsAndConditions} className="underline outline-none" tabIndex={-1}>
          Terms and Conditions
        </Link>
        {" and "}
        <Link href={paths.privacyPolicy} className="underline outline-none" tabIndex={-1}>
          Privacy Policy
        </Link>
      </p>
      <div className="mt-6 text-center xl:space-x-3">
        <Button
          className={clsx(
            "use-shadow-bright",
            "border border-transparent bg-my-purple text-16 text-white dark:text-white"
          )}
          onClick={() => {
            storeIsAgreed(true);
          }}
        >
          Agree - Enter Site
        </Button>
        <Button
          className="mt-3 border-3 border-my-purple bg-transparent text-16 text-my-purple xl:mt-0"
          onClick={() => {
            window.location.href = "http://www.google.com";
          }}
        >
          Disagree - Leave Site
        </Button>
      </div>
    </div>
  );
}

function PlayHardLayout({
  children,
  text,
  hide,
}: {
  children?: ReactNode;
  text?: ReactNode;
  hide?: {
    logo?: "onMobiles";
    text?: "onMobiles" | false;
  };
}) {
  return (
    <>
      <Link
        href="/"
        className={clsx(
          hide?.logo === "onMobiles" ? "hidden" : "xl:hidden",
          "mx-auto -my-8 min-h-0",
          "max-w-xs sm:max-w-sm",
          "px-2 sm:p-0"
        )}
      >
        <img src="/logo.png" alt="" className="mx-auto max-h-full max-w-full" />
      </Link>
      <div className="flex grow flex-col xl:flex-row">
        <div
          className={clsx(
            hide?.logo === "onMobiles" ? "hidden xl:flex" : "flex",
            "xl:grow",
            "items-start xl:items-center",
            "justify-center xl:justify-start",
            "mt-3 mb-4 xl:my-auto xl:ml-40"
          )}
        >
          <h1
            className={clsx(
              "font-bold",
              "xl:mb-38 3xl:mb-64",
              "text-[1.6rem] md:text-[2rem] xl:text-[2.5rem] 3xl:text-[3rem]",
              "text-center xl:text-left"
            )}
          >
            {text || (
              <>
                Don’t play hard to get,
                <br />
                play hard to <span className="text-my-purple">forget.</span>
              </>
            )}
          </h1>
        </div>
        <div className="flex grow">
          {children || (
            <div
              className={clsx(
                "flex grow",
                "p-4 xl:p-0",
                "items-end xl:items-center",
                "justify-center xl:justify-end",
                "xl:mr-10 3xl:mr-52"
              )}
            >
              <div className="w-full max-w-lg xl:mb-38 3xl:mb-64 3xl:max-w-xl ">
                <AgreementPanel />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default PlayHardLayout;
