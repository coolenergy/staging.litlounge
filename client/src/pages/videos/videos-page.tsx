import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import MediaNavigator from "~/components/media-navigator";
import { apiQueryHooks } from "~/hooks/api-query-hooks";
import useBreakpointValue from "~/hooks/use-breakpoint-value";
import PageLayout from "~/layouts/page";
import { getParam } from "~/utils/get-param";

const VideosPage = () => {
  const router = useRouter();
  const username = getParam(router.query, "username");
  const { data: model } = apiQueryHooks.useModel({
    username,
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [cols, rows] = useBreakpointValue([2, 4] as const, {
    xl: [3, 3] as const,
  });
  const pageSize = cols * rows;
  const { data: videos } = apiQueryHooks.useModelVideos({
    performerId: model?._id,
    offset: pageIndex * pageSize,
    limit: pageSize,
  });
  return (
    <PageLayout>
      <div className="mx-8 flex grow flex-col">
        <MediaNavigator
          total={videos?.total}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          mediaObjects={videos?.data.map((video) => ({
            type: "video",
            coverUrl: video.thumbnail,
          }))}
          cols={cols}
          rows={rows}
          style={{
            portrait: true,
          }}
        />
      </div>
    </PageLayout>
  );
};

export default dynamic(() => Promise.resolve(VideosPage), {
  ssr: false,
});
