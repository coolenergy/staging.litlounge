import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import MediaNavigator from "~/components/media-navigator";
import { apiQueryHooks } from "~/hooks/api-query-hooks";
import useBreakpointValue from "~/hooks/use-breakpoint-value";
import PageLayout from "~/layouts/page";
import { getParam } from "~/utils/get-param";
import { paths } from "~/utils/paths";

const GalleriesPage = () => {
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
  const { data: galeries } = apiQueryHooks.useModelGalleries({
    performerId: model?._id,
    offset: pageIndex * pageSize,
    limit: pageSize,
  });
  return (
    <PageLayout>
      <div className="mx-8 flex grow flex-col">
        <MediaNavigator
          total={galeries?.total}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          mediaObjects={galeries?.data.map((gallery) => ({
            type: "gallery",
            coverUrl: gallery.coverPhoto?.thumbnails[0],
            linkUrl: paths.galleryPhotos({ galleryId: gallery._id }),
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

export default dynamic(() => Promise.resolve(GalleriesPage), {
  ssr: false,
});
