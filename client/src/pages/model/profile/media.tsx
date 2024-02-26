import { clsx } from "clsx";
import dynamic from "next/dynamic";
import Link from "next/link";
import MediaGrid, { MediaObject } from "~/components/media-grid";
import { apiQueryHooks } from "~/hooks/api-query-hooks";
import useBreakpointValue from "~/hooks/use-breakpoint-value";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import { calcAgeByBirth } from "~/utils/calc-age-by-birth";
import { consts } from "~/utils/consts";
import { paths } from "~/utils/paths";
import PageContext from "../page-context";

function useColsRows() {
  return useBreakpointValue([3, 1] as const, {
    xl: [5, 1] as const,
  });
}

function Top({
  title,
  seeMoreUrl,
  mediaObjects,
}: {
  title: string;
  seeMoreUrl: string;
  mediaObjects: MediaObject[];
}) {
  const [cols, rows] = useColsRows();
  return (
    <div className="flex flex-col gap-2">
      <div className={clsx("hidden xl:flex", "h-8 items-center")}>
        <span className="mr-auto font-bold">{title}</span>
        <Link
          href={seeMoreUrl}
          className={clsx(
            "use-shadow focus-visible:use-outline",
            "flex h-8 items-center rounded-10 bg-my-purple px-4"
          )}
        >
          See All
        </Link>
      </div>
      <div className={clsx("mx-6 xl:m-0", "h-32")}>
        <MediaGrid
          mediaObjects={mediaObjects}
          cols={cols}
          rows={rows}
          style={{
            gap: 4,
          }}
        />
      </div>
    </div>
  );
}

function Media() {
  const page = useContextOrThrow(PageContext);
  const [cols, rows] = useColsRows();
  const limit = cols * rows;
  const { data: galleries } = apiQueryHooks.useModelGalleries({
    performerId: page.model?._id,
    limit,
  });
  const { data: videos } = apiQueryHooks.useModelVideos({
    performerId: page.model?._id,
    limit,
  });
  const { data: relatedCams } = apiQueryHooks.useModelRelatedCams({
    performerId: page.model?._id,
    limit,
  });
  return (
    <div
      className={clsx(
        "my-6 xl:my-0",
        "flex grow flex-col gap-4",
        "use-no-scrollbar overflow-scroll"
      )}
    >
      {!!galleries?.data.length && (
        <Top
          title="Galleries"
          seeMoreUrl={paths.modelGalleries({
            username: page.model?.username ?? "",
          })}
          mediaObjects={galleries.data.map((item) => {
            const { _id, coverPhoto } = item;
            return {
              type: "gallery",
              coverUrl: coverPhoto?.thumbnails[0] || consts.image.nothing,
              linkUrl: paths.galleryPhotos({
                galleryId: _id,
              }),
            };
          })}
        />
      )}
      {!!videos?.data.length && (
        <Top
          title="Videos"
          seeMoreUrl={paths.modelVideos({
            username: page.model?.username ?? "",
          })}
          mediaObjects={videos.data.map((item) => {
            const { thumbnail, video } = item;
            return {
              type: "video",
              coverUrl: thumbnail || video?.thumbnails?.[0] || consts.image.nothing,
              linkUrl: video?.url,
            };
          })}
        />
      )}
      {!!relatedCams?.data.length && (
        <Top
          title="Related Cams"
          seeMoreUrl={paths.home}
          mediaObjects={relatedCams.data.map((item) => {
            const { username, avatar, dateOfBirth } = item;
            return {
              type: "cam",
              coverUrl: avatar || consts.image.nothing,
              linkUrl: paths.model({
                username: username ?? "",
              }),
              name: username ?? "",
              age: calcAgeByBirth(dateOfBirth) ?? "?",
              country: "ToDo",
            };
          })}
        />
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(Media), {
  ssr: false,
});
