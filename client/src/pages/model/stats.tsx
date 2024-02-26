import { clsx } from "clsx";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import { consts } from "~/utils/consts";
import { convertMsToHours } from "~/utils/convert-ms-to-hours";
import PageContext from "./page-context";
import SexAndAge from "./sex-and-age";

const { nothing, waiting } = consts.text;

function Stats() {
  const page = useContextOrThrow(PageContext);
  const hours = page.model ? convertMsToHours(page.model.stats?.totalStreamTime ?? 0) : waiting;
  const likes = page.model ? page.model.stats?.favorites ?? nothing : waiting;
  return (
    <div className="flex items-center justify-center">
      <div className="flex rounded-10 bg-my-purple py-3">
        <div className={clsx("hidden xl:flex", "items-center justify-center")}>
          <div className={clsx("hidden xl:block", "px-5")}>
            <SexAndAge />
          </div>
          <div className="h-6 w-[2px] bg-white" />
        </div>
        <div className="flex flex-col items-center justify-center px-5">
          <div className={clsx("text-13 leading-none xl:text-31 xl:leading-none", "font-semibold")}>
            {hours}
          </div>
          <span className="text-9 xl:text-19">Hours</span>
        </div>
        <div className="flex items-center">
          <div className="h-6 w-[2px] bg-white" />
          <div className="flex flex-col items-center justify-center px-5">
            <div
              className={clsx("text-13 leading-none xl:text-31 xl:leading-none", "font-semibold")}
            >
              {likes}
            </div>
            <span className="text-9 xl:text-19">Likes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
