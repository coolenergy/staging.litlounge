import { clsx } from "clsx";
import Navigator from "./navigator";
import Slider from "./slider";

function Models() {
  return (
    <>
      <div className={clsx("flex xl:hidden", "grow")}>
        <Navigator />
      </div>
      <div className="hidden xl:block">
        <Slider />
      </div>
    </>
  );
}

export default Models;
