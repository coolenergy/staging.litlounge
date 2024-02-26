import { clsx } from "clsx";
import { apiQueryHooks } from "~/hooks/api-query-hooks";
import { ModelSearchResponse } from "~/utils/api";
import { calcAgeByBirth } from "~/utils/calc-age-by-birth";
import LocationSvg from "../location.svg";
import Player from "./player";
import Slider from "./slider";

function Info({ model }: { model: ModelSearchResponse | undefined }) {
  if (model == null) {
    return null;
  }
  return (
    <div className="mx-2 my-10 flex flex-col gap-2">
      <span>
        {model.username} {calcAgeByBirth(model.dateOfBirth)}
      </span>
      <div className="flex items-center gap-2">
        <LocationSvg className="h-5 w-5" />
        <span>{model.country}</span>
      </div>
      <span>{model.aboutMe}</span>
    </div>
  );
}

function Streams() {
  const { data: models } = apiQueryHooks.useModels({});
  if (models === undefined) {
    return null;
  }
  const mainModel = models.data[0];
  const otherModels = models.data.slice(1);
  return (
    <>
      <Slider models={otherModels} />
      <div className={clsx("my-4 flex", "h-1/4 xl:h-96")}>
        <Player model={mainModel} />
        <div className={clsx("hidden xl:block", "w-2/5")}>
          <Info model={mainModel} />
        </div>
      </div>
    </>
  );
}

export default Streams;
