import { clsx } from "clsx";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import PageContext from "../page-context";
import Tips from "../tips";
import XSvg from "./x.svg";

function TipMenu({
  hiddenInDesktopFullScreen,
  setHiddenInDesktopFullScreen,
}: {
  hiddenInDesktopFullScreen: boolean;
  setHiddenInDesktopFullScreen: (value: boolean) => void;
}) {
  const page = useContextOrThrow(PageContext);
  return (
    <div
      className={clsx(
        "relative flex",
        page.isStreamInFullScreen && hiddenInDesktopFullScreen && "xl:hidden",
        "min-h-0 xl:min-h-min",
        "xl:max-w-sm",
        "w-full grow",
        "xl:rounded-10",
        "bg-[#232323]/80",
        "px-4 py-6"
      )}
    >
      {page.isStreamInFullScreen && (
        <button
          className={clsx(
            "absolute top-5 right-5",
            "hidden xl:block",
            "h-6 w-6 rounded-full bg-[#5f5f5f] p-1.5",
            "focus-visible:use-outline"
          )}
          onClick={() => {
            setHiddenInDesktopFullScreen(true);
          }}
        >
          <XSvg />
        </button>
      )}
      <Tips
        label="Tip Menu"
        options={[
          {
            action: "Smoke One",
            priceInTokens: 5,
          },
          {
            action: "10 Push Ups",
            priceInTokens: 10,
          },
          {
            action: "Ghost Inhale",
            priceInTokens: 40,
          },
          {
            action: "Say Your Name",
            priceInTokens: 75,
          },
        ]}
      />
    </div>
  );
}

export default TipMenu;
