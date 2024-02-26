import { clsx } from "clsx";
import { useState } from "react";
import { apiMutationHooks } from "~/hooks/api-mutation-hooks";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import DialogLayout from "~/layouts/dialog";
import ChatSvg from "./chat.svg";
import HeartSvg from "./heart.svg";
import PageContext from "./page-context";
import Tips from "./tips";

function TipOptionsDialog({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
  return (
    <DialogLayout open={open} setOpen={setOpen}>
      <Tips
        label="How Many Tokens Would You Like To Tip?"
        options={[20, 50, 100, 200].map((priceInTokens) => ({
          priceInTokens,
        }))}
      />
    </DialogLayout>
  );
}

function Buttons() {
  const page = useContextOrThrow(PageContext);
  const [isTipOptionsDialogOpen, setTipOptionsDialogOpen] = useState(false);
  const isLiked = page.model ? page.model.isFavorite : false;
  const likeModel = apiMutationHooks.useLikeModel();
  return (
    <>
      <div
        className={clsx(
          "flex h-10",
          "place-content-between",
          "items-start xl:items-center",
          "gap-1.5 xl:gap-3",
          "text-15 xl:text-20"
        )}
      >
        {page.isStreamInFullScreen || (
          <button
            className={clsx(
              "use-shadow focus-visible:use-outline",
              "flex",
              "items-center justify-center",
              "bg-my-purple px-4",
              "gap-1 xl:gap-2",
              "h-full xl:h-10",
              "rounded-40 xl:rounded-10"
            )}
          >
            <ChatSvg className="h-5 w-5" />
            Message
          </button>
        )}
        <button
          className={clsx(
            "focus-visible:use-outline",
            "hidden xl:block",
            "flex items-center justify-center",
            "h-full xl:h-10",
            "rounded-10 border-2 border-my-purple px-4 text-my-purple"
          )}
          onClick={() => {
            setTipOptionsDialogOpen(true);
          }}
        >
          Tip
        </button>
        <button
          className={clsx(
            "xl:use-shadow xl:focus-visible:use-outline",
            "flex items-center justify-center",
            "h-full rounded-10",
            "bg-transparent xl:bg-[#444444]",
            "px-2"
          )}
        >
          <HeartSvg
            className={clsx("h-6 w-6", isLiked ? "fill-my-purple" : "fill-white")}
            onClick={async () => {
              if (page.model == null || page.isModelValidation) {
                return;
              }
              await likeModel({ model: page.model, value: !page.model.isFavorite });
            }}
          />
        </button>
      </div>
      <TipOptionsDialog open={isTipOptionsDialogOpen} setOpen={setTipOptionsDialogOpen} />
    </>
  );
}

export default Buttons;
