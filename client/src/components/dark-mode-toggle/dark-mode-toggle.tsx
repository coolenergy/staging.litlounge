import { Switch } from "@headlessui/react";
import { clsx } from "clsx";
import { localStorageHooks } from "~/hooks/local-storage-hooks";
import DisabledSvg from "./disabled.svg";
import EnabledSvg from "./enabled.svg";

const className = {
  svg: clsx("h-7 w-7 xl:h-5 xl:w-5", "fill-[#010039] dark:fill-white xl:fill-white"),
};

function DarkModeToggle() {
  const [isDarkMode, storeIsDarkMode] = localStorageHooks.useIsDarkMode();
  return (
    <div className="flex items-center gap-4 xl:gap-2">
      <DisabledSvg alt="Dark mode disabled" className={className.svg} />
      <Switch
        checked={isDarkMode}
        onChange={storeIsDarkMode}
        className={clsx(
          "group relative inline-flex items-center justify-center",
          "h-9 w-18 xl:h-6 xl:w-12",
          "flex-shrink-0 cursor-pointer rounded-full outline-none"
        )}
      >
        <span
          className={clsx(
            "absolute",
            "transition-colors duration-200 ease-in-out",
            "bg-[#010039] dark:bg-white xl:bg-my-dark xl:dark:bg-my-dark",
            "h-9 w-18 xl:h-5 xl:w-12",
            "pointer-events-none mx-auto rounded-full"
          )}
        />
        <span
          className={clsx(
            "use-shadow group-focus-visible:use-outline",
            "absolute left-0 inline-block",
            "bg-my-purple xl:bg-white",
            "h-9 w-9 xl:h-6 xl:w-6",
            "transform transition-transform duration-200 ease-in-out",
            isDarkMode ? "translate-x-9 xl:translate-x-6" : "translate-x-0",
            "pointer-events-none rounded-full"
          )}
        />
      </Switch>
      <EnabledSvg alt="Dark mode enabled" className={className.svg} />
    </div>
  );
}

export default DarkModeToggle;
