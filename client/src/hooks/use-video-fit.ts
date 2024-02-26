import { useEffect, useState } from "react";
import { chooseBy } from "~/utils/choose-by";

export type VideoFit = "cover" | "contain";

function useVideoFit({ videoWidth, videoHeight }: { videoWidth: number; videoHeight: number }) {
  const [videoOrientation, setVideoOrientation] = useState<"landscape" | "portrait">();
  const [videoFitMode, setVideoFitMode] = useState<VideoFit>();
  useEffect(() => {
    if (videoOrientation == null && videoWidth && videoHeight) {
      setVideoOrientation(videoWidth >= videoHeight ? "landscape" : "portrait");
    }
  }, [videoWidth, videoHeight]);
  useEffect(() => {
    setVideoFitMode(
      chooseBy(videoOrientation ?? "undefined", {
        undefined,
        landscape: "cover",
        portrait: "contain",
      })
    );
  }, [videoOrientation]);
  return [videoFitMode, setVideoFitMode] as const;
}

export default useVideoFit;
