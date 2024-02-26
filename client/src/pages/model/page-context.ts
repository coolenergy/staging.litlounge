import { createContext } from "react";
import { Model } from "~/utils/api";

type PageContext = {
  readonly model: Model | undefined;
  readonly modelAge: number | string;
  readonly modelHeader: Model["header"];
  readonly modelAvatar: Model["avatar"];
  readonly isModelValidation: boolean;
  readonly isStreamInFullScreen: boolean;
  readonly setStreamInFullScreen: (value: boolean) => void;
};

const PageContext = createContext<PageContext | undefined>(undefined);
PageContext.displayName = "ModelPageContext";

export default PageContext;
