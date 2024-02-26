import * as hi24o from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { useState } from "react";
import VideoSource from "~/components/video-source";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import useVideoFit, { VideoFit } from "~/hooks/use-video-fit";
import EyeSvg from "~/svgs/eye.svg";
import { calcAgeByBirth } from "~/utils/calc-age-by-birth";
import { chooseBy } from "~/utils/choose-by";
import { consts } from "~/utils/consts";
import PageContext from "../page-context";
import ArrowLeftSvg from "./arrow-left.svg";
import ScreenFullSvg from "./screen-full.svg";

function LiveIndicator() {
  return (
    <div
      className={clsx(
        "h-8 rounded-10",
        "xl:bg-my-purple",
        "px-5 py-0.5",
        "text-17",
        "xl:use-shadow"
      )}
    >
      Live
    </div>
  );
}

function NavigationArrows() {
  return (
    <div className="flex place-content-between">
      <button
        className={clsx("h-10 w-10 rounded-full bg-my-purple p-2", "focus-visible:use-outline")}
      >
        <ArrowLeftSvg />
      </button>
      <button
        className={clsx("h-10 w-10 rounded-full bg-my-purple p-2", "focus-visible:use-outline")}
      >
        <ArrowLeftSvg className="-scale-100" />
      </button>
    </div>
  );
}

function ProfileDetails() {
  const page = useContextOrThrow(PageContext);
  if (page.model == null) {
    return null;
  }
  return (
    <div className="flex items-center gap-4">
      <img
        src={page.model ? page.model.avatar || consts.image.nothing : consts.image.waiting}
        alt="Avatar"
        className="h-36 w-36 rounded-full bg-white object-cover"
      />
      <div className="flex flex-col">
        <div className="flex gap-2">
          <div className="text-39 font-medium">{page.model.username}</div>
          <div className="text-39 font-bold">{calcAgeByBirth(page.model.dateOfBirth) ?? "?"}</div>
        </div>
        <div className="text-32">{page.model.country ?? "?"}</div>
      </div>
    </div>
  );
}

function ViewsDisplay() {
  return (
    <div className={clsx("invisible xl:visible", "flex grow items-center gap-2")}>
      <EyeSvg className={clsx("h-8 w-8")} />
      <span className="text-22 font-semibold">1234</span>
    </div>
  );
}

function FullScreenButton() {
  const page = useContextOrThrow(PageContext);
  const Icon = page.isStreamInFullScreen ? hi24o.XMarkIcon : ScreenFullSvg;
  return (
    <button
      className={clsx("focus-visible:use-outline", "h-full w-full")}
      onClick={() => {
        page.setStreamInFullScreen(!page.isStreamInFullScreen);
      }}
    >
      <Icon />
    </button>
  );
}

function VideoFitButton({
  videoFit,
  setVideoFit,
}: {
  videoFit: VideoFit | undefined;
  setVideoFit: (value: VideoFit) => void;
}) {
  const Icon = chooseBy(videoFit ?? "undefined", {
    undefined: hi24o.ViewfinderCircleIcon,
    cover: hi24o.ArrowsPointingInIcon,
    contain: hi24o.ArrowsPointingOutIcon,
  });
  return (
    <button disabled={videoFit === undefined}>
      <Icon
        className={clsx("h-full w-full", videoFit || "animate-spin")}
        onClick={() => {
          if (videoFit !== undefined) {
            setVideoFit(
              chooseBy(videoFit, {
                cover: "contain",
                contain: "cover",
              })
            );
          }
        }}
      />
    </button>
  );
}

function Player() {
  const page = useContextOrThrow(PageContext);
  const [videoHeight, setVideoHeight] = useState(0);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoFit, setVideoFit] = useVideoFit({ videoHeight, videoWidth });
  return (
    <div
      className={clsx(
        page.isStreamInFullScreen ? "absolute inset-0" : "relative",
        "h-full w-full",
        "xl:border-b-8 xl:border-my-purple"
      )}
    >
      <video
        autoPlay
        muted
        className={clsx(
          "h-full w-full bg-black",
          chooseBy(videoFit ?? "cover", {
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
      {page.isStreamInFullScreen ? (
        <>
          <div
            className={clsx(
              "absolute",
              "xl:top-10",
              "bottom-7 xl:bottom-auto",
              "left-6 xl:left-10",
              "h-10 w-10",
              "rounded-6 bg-my-dark/40 p-1.5"
            )}
          >
            <FullScreenButton />
          </div>
          <div
            className={clsx(
              "absolute",
              "xl:top-24",
              "bottom-20 xl:bottom-auto",
              "left-6 xl:left-10",
              "h-10 w-10",
              "rounded-6 bg-my-dark/40 p-1.5"
            )}
          >
            <VideoFitButton videoFit={videoFit} setVideoFit={setVideoFit} />
          </div>
          <div
            className={clsx(
              "absolute left-10 right-10 top-1/2 -translate-y-1/2",
              "hidden xl:block"
            )}
          >
            <NavigationArrows />
          </div>
          <div className={clsx("absolute left-10 bottom-10", "hidden xl:block")}>
            <ProfileDetails />
          </div>
        </>
      ) : (
        <>
          <div className={clsx("absolute", "top-8 xl:top-4", "xl:right-4", "left-16 xl:left-auto")}>
            <LiveIndicator />
          </div>
          <div className="absolute left-10 bottom-2 flex items-center">
            <ViewsDisplay />
          </div>
          <div
            className={clsx(
              "absolute right-4 bottom-2",
              "flex h-10 w-10 items-center",
              "rounded-6 bg-my-dark/40 p-1.5"
            )}
          >
            <FullScreenButton />
          </div>
          <div
            className={clsx(
              "absolute right-4 bottom-14",
              "flex h-10 w-10 items-center",
              "rounded-6 bg-my-dark/40 p-1.5"
            )}
          >
            <VideoFitButton videoFit={videoFit} setVideoFit={setVideoFit} />
          </div>
        </>
      )}
    </div>
  );
}

export default Player;
