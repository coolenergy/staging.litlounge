import { useState } from "react";
import { useWindowSize } from "usehooks-ts";
import MediaNavigator from "~/components/media-navigator";
import { apiQueryHooks } from "~/hooks/api-query-hooks";
import { calcAgeByBirth } from "~/utils/calc-age-by-birth";
import { consts } from "~/utils/consts";
import { paths } from "~/utils/paths";

function Navigator() {
  const windowSize = useWindowSize();
  const maxWindowSize = Math.max(windowSize.height, windowSize.width);
  const [pageIndex, setPageIndex] = useState(0);
  const [cols, rows] = [2, maxWindowSize >= 768 ? 3 : maxWindowSize >= 580 ? 2 : 1] as const;
  const pageSize = cols * rows;
  const { data: models } = apiQueryHooks.useModels({
    offset: pageIndex * pageSize,
    limit: pageSize,
  });
  if (models === undefined) {
    return null;
  }
  return (
    <MediaNavigator
      total={models?.total}
      pageIndex={pageIndex}
      setPageIndex={setPageIndex}
      mediaObjects={models.data.map((model) => ({
        coverUrl: model.avatar || consts.image.nothing,
        linkUrl: paths.model({ username: model.username }),
        type: "cam",
        name: model.username,
        age: calcAgeByBirth(model.dateOfBirth) ?? consts.nbsp,
        country: model.country || consts.nbsp,
      }))}
      cols={cols}
      rows={rows}
      style={{
        portrait: true,
      }}
    />
  );
}

export default Navigator;
