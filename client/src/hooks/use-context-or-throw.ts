import { Context, useContext } from "react";

export const useContextOrThrow = <T>(context: Context<T | undefined>) => {
  const instance = useContext(context);
  if (instance == null) {
    throw Error(`You are outside of ${context.displayName} context!`);
  }
  return instance;
};
