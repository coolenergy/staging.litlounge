import { clsx } from "clsx";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import { consts } from "~/utils/consts";
import PageContext from "./page-context";

function NameAndCountry() {
  const page = useContextOrThrow(PageContext);
  const name = page.model ? page.model.username : consts.text.waiting;
  const country = page.model ? page.model.country ?? consts.text.nothing : consts.text.waiting;
  return (
    <div className="flex flex-col items-start justify-center">
      <div className={clsx("text-16 xl:text-37", "font-semibold")}>{name}</div>
      <div className="text-13 xl:text-23">{country}</div>
    </div>
  );
}

export default NameAndCountry;
