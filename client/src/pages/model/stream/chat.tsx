import { clsx } from "clsx";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { useState } from "react";
import { apiMutationHooks } from "~/hooks/api-mutation-hooks";
import { apiQueryHooks } from "~/hooks/api-query-hooks";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import { consts } from "~/utils/consts";
import PageContext from "../page-context";
import PlaneSvg from "./plane.svg";

function Chat({ setTipMenuHidden }: { setTipMenuHidden: (value: boolean) => void }) {
  const page = useContextOrThrow(PageContext);
  const { data: conversation } = apiQueryHooks.useStreamChat({
    modelId: page.model?._id,
  });
  const { data: messages } = apiQueryHooks.useStreamChatMessages({
    conversationId: conversation?._id,
  });
  const [text, setText] = useState("");
  const sendChatMessage = apiMutationHooks.useSendChatMessage({
    onSuccess: () => {
      setText("");
    },
  });
  return (
    <div
      className={clsx(
        "flex min-h-0",
        "xl:max-w-sm",
        "w-full grow flex-col gap-6",
        "xl:rounded-10",
        "bg-[#232323]/80",
        "px-4 py-6"
      )}
    >
      <div
        className={clsx("flex grow flex-col-reverse gap-2", "use-no-scrollbar overflow-y-scroll")}
      >
        {[...(messages?.data ?? [])].map(({ _id, senderInfo, createdAt, text }) => {
          const date = new Date(createdAt);
          return (
            <div key={_id} className="grid grid-cols-2 gap-1">
              <div>{senderInfo?.username ?? consts.text.nothing}</div>
              <div>{dayjs(date).fromNow()}</div>
              <div className="col-span-2">{text}</div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            value={text}
            placeholder="Tell something..."
            className={clsx(
              "focus-visible:use-outline",
              "h-10 xl:h-8",
              "w-full",
              "grow",
              "rounded-full xl:rounded-10",
              "px-4",
              "text-14 text-my-dark"
            )}
            onChange={(event) => {
              setText(event.target.value);
            }}
          />
          <button
            className={clsx(
              "focus-visible:use-outline",
              "flex shrink-0 items-center justify-center",
              "h-10 w-10 xl:h-8 xl:w-8",
              "rounded-full xl:rounded-10",
              "bg-my-purple"
            )}
            onClick={async () => {
              if (conversation == null) {
                // TODO: or if conversation validation
                return;
              }
              await sendChatMessage({ conversationId: conversation?._id, text });
            }}
          >
            <PlaneSvg className={clsx("h-4 w-4")} />
          </button>
        </div>
        <div
          className={clsx(
            "hidden xl:flex",
            "gap-2",
            page.isStreamInFullScreen ? "text-21" : "text-22"
          )}
        >
          <button
            className={clsx(
              "focus-visible:use-outline",
              "flex flex-1 items-center justify-center",
              "h-8 whitespace-pre rounded-10 bg-my-purple px-4"
            )}
          >
            <span className={clsx("hidden", !page.isStreamInFullScreen && "xl:inline")}>
              Exclusive{" "}
            </span>
            <span>Chat</span>
          </button>
          {page.isStreamInFullScreen && (
            <button
              className={clsx(
                "focus-visible:use-outline",
                "flex-1",
                "h-8 rounded-10 bg-my-purple px-4"
              )}
              onClick={() => setTipMenuHidden(false)}
            >
              Tip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Chat), {
  ssr: false,
});
