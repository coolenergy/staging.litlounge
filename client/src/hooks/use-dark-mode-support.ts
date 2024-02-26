import { useEffect } from "react";
import { localStorageHooks } from "~/hooks/local-storage-hooks";

const DARK_MODE_CLASS = "dark";

function useDarkModeSupport() {
  const [isDarkMode] = localStorageHooks.useIsDarkMode();
  useEffect(() => {
    const body = document.querySelector("body");
    if (body == null) {
      throw Error("Failed to find the body tag");
    }
    const bodyClassList = body.classList;
    if (isDarkMode) {
      bodyClassList.add(DARK_MODE_CLASS);
    } else {
      bodyClassList.remove(DARK_MODE_CLASS);
    }
  }, [isDarkMode]);
}

export { useDarkModeSupport };
