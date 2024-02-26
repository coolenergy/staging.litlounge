import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

enum LocalStorageKey {
  isAgreed,
  isDarkMode,
  jwt,
}

function useLocalStorageValue<T>(
  key: keyof typeof LocalStorageKey,
  defaultLocalStorageValue: T
): [T | undefined, (value: T) => void] {
  const [localStorageValue, setLocalStorageValue] = useLocalStorage<T>(
    key,
    defaultLocalStorageValue
  );
  const [value, setValue] = useState<T>();
  useEffect(() => {
    setValue(localStorageValue);
  }, [localStorageValue]);
  return [value, setLocalStorageValue];
}

function useIsAgreed() {
  return useLocalStorageValue("isAgreed", false);
}

function useIsDarkMode() {
  const defaultValue = true;
  const [isDarkMode, setDarkMode] = useLocalStorageValue("isDarkMode", defaultValue);
  return [isDarkMode ?? defaultValue, setDarkMode] as const;
}

function useJwt() {
  return useLocalStorageValue<string | undefined>("jwt", undefined);
}

export const localStorageHooks = {
  useIsAgreed,
  useIsDarkMode,
  useJwt,
};
