import { clsx } from "clsx";
import Link from "next/link";
import { useState } from "react";
import VideoSource from "~/components/video-source";
import useVideoFit from "~/hooks/use-video-fit";
import EyeSvg from "~/svgs/eye.svg";
import { ModelSearchResponse } from "~/utils/api";
import { chooseBy } from "~/utils/choose-by";
import { consts } from "~/utils/consts";
import { paths } from "~/utils/paths";

function Player({ model }: { model: ModelSearchResponse }) {
  const [videoHeight, setVideoHeight] = useState(0);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoFit] = useVideoFit({ videoHeight, videoWidth });
  return (
    <div
      className={clsx(
        "relative",
        "h-full",
        "w-full xl:w-3/5",
        "overflow-hidden",
        "rounded-10 xl:rounded-none"
      )}
    >
      <Link href={paths.model({ username: model.username })}>
        <video
          autoPlay
          muted
          className={clsx(
            "h-full max-h-96 xl:max-h-none",
            "w-full",
            "bg-black/50",
            chooseBy(videoFit ?? "undefined", {
              undefined: "object-cover",
              cover: "object-cover",
              contain: "object-contain",
            })
          )}
          onResize={(event) => {
            setVideoHeight(event.currentTarget.videoHeight);
            setVideoWidth(event.currentTarget.videoWidth);
          }}
        >
          <VideoSource />
        </video>
      </Link>
      <div className={clsx("absolute top-3 left-3 h-4")}>
        <div className={clsx("rounded-full bg-my-purple px-2 text-14")}>Live</div>
      </div>
      <div className={clsx("absolute top-3 right-3", "flex h-4 items-center gap-1")}>
        <EyeSvg className="h-4 w-4" />
        {model.stats.views ?? 0}
      </div>
      <div className={clsx("absolute bottom-3 left-3", "flex items-center gap-2")}>
        <img
          src={model.avatar ?? consts.image.nothing}
          className={clsx("h-8 w-8 xl:h-10 xl:w-10", "rounded-full")}
        />
        <div className="text-14">
          <div>{model.username}</div>
          <div>{model.country || consts.nbsp}</div>
        </div>
      </div>
    </div>
  );
}

export default Player;
