import { clsx } from "clsx";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import FemaleSvg from "./female.svg";
import PageContext from "./page-context";

function SexAndAge() {
  const page = useContextOrThrow(PageContext);
  return (
    <div className="flex items-center gap-1">
      <FemaleSvg className="h-5 w-5 xl:h-8 xl:w-8" />
      <span className={clsx("text-16 xl:text-33", "font-semibold")}>{page.modelAge}</span>
    </div>
  );
}

export default SexAndAge;
