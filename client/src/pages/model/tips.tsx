import { clsx } from "clsx";
import { useState } from "react";
import AppContext from "~/components/app-context";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import PageContext from "./page-context";

type Option = {
  action?: string;
  priceInTokens: number;
};

function Tips({ label, options }: { label: string; options: Option[] }) {
  const app = useContextOrThrow(AppContext);
  const page = useContextOrThrow(PageContext);
  const [value, setValue] = useState("");
  return (
    <div className="flex grow flex-col gap-2">
      <span className={clsx("hidden xl:inline", "text-29 font-semibold")}>{label}</span>
      <div className={clsx("flex grow flex-col gap-2", "use-no-scrollbar overflow-y-scroll")}>
        {options.map(({ action, priceInTokens }, index) => {
          const price = `${priceInTokens} Tokens`;
          return (
            <div
              key={index}
              className={clsx("focus-visible:use-outline", "flex flex-col gap-2 text-19")}
            >
              <div className="flex whitespace-nowrap">
                <div
                  className="grow cursor-pointer hover:underline"
                  onClick={() => {
                    setValue(priceInTokens.toString());
                  }}
                >
                  {action ?? price}
                </div>
                {action && <div className="ml-4 w-28 font-semibold text-my-purple">{price}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <span className={clsx("hidden xl:inline", "text-sm font-semibold")}>Send a tip:</span>
      <div className={clsx("flex", "xl:flex-col", "gap-2")}>
        <input
          type="text"
          value={value}
          placeholder="50 tokens"
          className={clsx(
            "focus-visible:use-outline",
            "grow",
            "h-10 xl:h-9",
            "w-full",
            "rounded-full xl:rounded-10",
            "px-4 py-1",
            "text-20 font-light text-black"
          )}
          onChange={(event) => {
            const input = event.target.value;
            if (input === "") {
              setValue("");
            } else {
              const intOrNaN = Number.parseInt(input);
              if (intOrNaN >= 0) {
                setValue(intOrNaN.toString());
              }
            }
          }}
        />
        <button
          className={clsx(
            "focus-visible:use-outline",
            "h-10 xl:h-8",
            "rounded-full xl:rounded-10",
            "bg-my-purple px-4",
            page.isStreamInFullScreen ? "text-21" : "text-22"
          )}
          onClick={() => {
            app.openBuyTokensDialog();
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Tips;
