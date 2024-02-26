import { consts } from "~/utils/consts";
import { useWindowWidth } from "./use-window-size";

type Breakpoint = keyof typeof consts.breakpoints;

const breakpoints: Breakpoint[] = ["3xl", "2xl", "xl", "lg", "md", "sm"];

function useBreakpointValue<T>(defaultValue: T, breakpointValues: Partial<Record<Breakpoint, T>>) {
  const screenWidth = useWindowWidth();
  for (const breakpoint of breakpoints) {
    const breakpointValue = breakpointValues[breakpoint];
    if (screenWidth > consts.breakpoints[breakpoint] && breakpointValue !== undefined) {
      return breakpointValue;
    }
  }
  return defaultValue;
}

export default useBreakpointValue;
