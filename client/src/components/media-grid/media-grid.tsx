import { clsx } from "clsx";
import Link from "next/link";
import { useState } from "react";
import DialogLayout from "~/layouts/dialog";
import { chooseBy } from "~/utils/choose-by";
import { MediaObject } from "./media-object";
import PlaySvg from "./play.svg";

function MediaDialog({
  isOpen,
  setOpen,
  type,
  url,
}: {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
  type: "image" | "video";
  url: string;
}) {
  return (
    <DialogLayout open={isOpen} setOpen={setOpen} position="screen">
      <div className="h-full w-full bg-black">
        {(() => {
          switch (type) {
            case "image":
              return <img src={url} alt={""} className="h-full w-full object-contain" />;
            case "video":
              return (
                <video
                  src={url}
                  preload="metadata"
                  controls
                  className="h-full w-full object-contain"
                />
              );
          }
        })()}
      </div>
    </DialogLayout>
  );
}

function MediaGridItem({ mediaObject }: { mediaObject: MediaObject }) {
  const [isMediaDialogOpen, setMediaDialogOpen] = useState(false);
  return (
    <>
      <Link
        href={mediaObject.linkUrl ?? "#"}
        className={clsx(
          "focus-visible:use-outline",
          "relative cursor-pointer",
          "overflow-hidden rounded-10"
        )}
        onClick={(event) => {
          if (mediaObject.type === "image" || mediaObject.type === "video") {
            event.preventDefault();
            setMediaDialogOpen(true);
          }
        }}
      >
        <PlaySvg
          className={clsx(
            "absolute h-14 w-14",
            "top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2",
            mediaObject.type === "video" ? "block" : "hidden"
          )}
        />
        <img
          src={mediaObject.coverUrl}
          className="h-full w-full bg-my-background/60 object-cover"
        />
        {mediaObject.type === "cam" && (
          <div className={clsx("absolute inset-0 flex grow flex-col justify-end p-4")}>
            <div className="flex">
              <span className="grow font-medium">{mediaObject.name}</span>
              <span className="font-bold">{mediaObject.age}</span>
            </div>
            <div className="text-16">{mediaObject.country}</div>
          </div>
        )}
      </Link>
      {(mediaObject.type === "image" || mediaObject.type === "video") && (
        <MediaDialog
          isOpen={isMediaDialogOpen}
          setOpen={setMediaDialogOpen}
          type={mediaObject.type}
          url={mediaObject.linkUrl ?? ""}
        />
      )}
    </>
  );
}

export type MediaGridProps = {
  mediaObjects: MediaObject[] | undefined;
  cols: 2 | 3 | 4 | 5;
  rows: 1 | 2 | 3 | 4;
  style?: {
    portrait?: boolean;
    gap?: 1 | 2 | 3 | 4;
  };
};

function MediaGrid({ mediaObjects, cols, rows, style }: MediaGridProps) {
  return (
    <div
      className={clsx(
        "grid h-full w-full place-content-start place-items-stretch",
        chooseBy(cols, {
          2: clsx("grid-cols-2", style?.portrait && "landscape:grid-rows-2"),
          3: clsx("grid-cols-3", style?.portrait && "landscape:grid-rows-3"),
          4: clsx("grid-cols-4", style?.portrait && "landscape:grid-rows-4"),
          5: clsx("grid-cols-5", style?.portrait && "landscape:grid-rows-5"),
        }),
        chooseBy(rows, {
          1: clsx("grid-rows-1", style?.portrait && "landscape:grid-cols-1"),
          2: clsx("grid-rows-2", style?.portrait && "landscape:grid-cols-2"),
          3: clsx("grid-rows-3", style?.portrait && "landscape:grid-cols-3"),
          4: clsx("grid-rows-4", style?.portrait && "landscape:grid-cols-4"),
        }),
        chooseBy(style?.gap ?? 4, {
          1: "gap-1",
          2: "gap-2",
          3: "gap-3",
          4: "gap-4",
        })
      )}
    >
      {mediaObjects?.map((mediaObject, index) => (
        <MediaGridItem key={index} mediaObject={mediaObject} />
      ))}
    </div>
  );
}

export default MediaGrid;
