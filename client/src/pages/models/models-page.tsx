import dynamic from "next/dynamic";
import { useState } from "react";
import AppContext from "~/components/app-context";
import MediaNavigator from "~/components/media-navigator";
import { apiQueryHooks } from "~/hooks/api-query-hooks";
import useBreakpointValue from "~/hooks/use-breakpoint-value";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import PageLayout from "~/layouts/page";
import { calcAgeByBirth } from "~/utils/calc-age-by-birth";
import { consts } from "~/utils/consts";
import { paths } from "~/utils/paths";

function ModelsPage() {
  const app = useContextOrThrow(AppContext);
  const [pageIndex, setPageIndex] = useState(0);
  const [cols, rows] = useBreakpointValue([2, 4] as const, {
    xl: [3, 3] as const,
  });
  const pageSize = cols * rows;
  const { data: models } = apiQueryHooks.useModels({
    query: app.searchQuery,
    offset: pageIndex * pageSize,
    limit: pageSize,
  });
  return (
    <PageLayout bg={["bg-mobile-models.jpg"]}>
      <div className="mx-8 flex grow flex-col">
        <MediaNavigator
          total={models?.total}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          mediaObjects={models?.data.map((model) => ({
            type: "cam",
            coverUrl: model.avatar || consts.image.nothing,
            linkUrl: paths.model({
              username: model.username,
            }),
            name: model.username,
            age: calcAgeByBirth(model.dateOfBirth) ?? "?",
            country: "ToDo",
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

export default dynamic(() => Promise.resolve(ModelsPage), {
  ssr: false,
});
