import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import MediaNavigator from "~/components/media-navigator";
import { apiQueryHooks } from "~/hooks/api-query-hooks";
import useBreakpointValue from "~/hooks/use-breakpoint-value";
import PageLayout from "~/layouts/page";
import { getParam } from "~/utils/get-param";

function GalleryPage() {
  const router = useRouter();
  const id = getParam(router.query, "id");
  const [pageIndex, setPageIndex] = useState(0);
  const [cols, rows] = useBreakpointValue([2, 4] as const, {
    xl: [3, 3] as const,
  });
  const pageSize = cols * rows;
  const { data: photos } = apiQueryHooks.useModelGalleryPhotos({
    galleryId: id,
    offset: pageIndex * pageSize,
    limit: pageSize,
  });
  return (
    <PageLayout>
      <div className="mx-8 flex grow flex-col">
        <MediaNavigator
          total={photos?.total}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          mediaObjects={photos?.data.map((photo) => ({
            type: "image",
            coverUrl: photo.photo?.url,
            linkUrl: photo.photo?.url,
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
}

export default dynamic(() => Promise.resolve(GalleryPage), {
  ssr: false,
});
