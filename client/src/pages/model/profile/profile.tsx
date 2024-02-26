import { clsx } from "clsx";
import { useState } from "react";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import { chooseBy } from "~/utils/choose-by";
import AboutAndTags from "../about-and-tags";
import Buttons from "../buttons";
import LeftRightTabs, { ModelLeftRightTab } from "../left-right-tabs";
import NameAndCountry from "../name-and-country";
import PageContext from "../page-context";
import SexAndAge from "../sex-and-age";
import Stats from "../stats";
import Calendar from "./calendar";
import Media from "./media";

function CalendarAndMedia() {
  const [selectedTab, setSelectedTab] = useState<ModelLeftRightTab>("left");
  return (
    <>
      <div className={clsx("flex xl:hidden", "min-h-0 grow flex-col")}>
        <LeftRightTabs
          leftTabTitle="Calendar"
          rightTabTitle="Media"
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
        {chooseBy(selectedTab, {
          left: <Calendar />,
          right: <Media />,
        })}
      </div>
      <div className={clsx("hidden xl:flex", "ml-10 mr-20 mt-2", "gap-16")}>
        <div className="flex">
          <Calendar />
        </div>
        <div className="flex grow">
          <Media />
        </div>
      </div>
    </>
  );
}

function Profile() {
  const page = useContextOrThrow(PageContext);
  const isTestCase = page.model?.username === "ario";
  return (
    <div className="flex min-h-0 grow flex-col">
      <img
        src={page.modelHeader}
        alt="Header"
        className={clsx(
          "w-full rounded-b-20 bg-my-light object-cover",
          "h-1/3 xl:h-72",
          isTestCase && "hidden"
        )}
      />
      <div className={clsx("flex flex-col", "mx-4 mb-4 xl:mx-10")}>
        <div className={clsx("flex grow", "gap-2 xl:gap-4")}>
          <div
            className={clsx(
              isTestCase ? "my-auto" : "-mt-8 xl:-mt-14 3xl:mt-0",
              "shrink-0 3xl:py-8"
            )}
          >
            <img
              src={page.modelAvatar}
              alt="Avatar"
              className={clsx(
                "h-24 w-24 xl:h-40 xl:w-40 3xl:h-60 3xl:w-60",
                "rounded-full border-3 border-my-purple bg-my-light object-cover"
              )}
            />
          </div>
          <div className="flex grow flex-col 3xl:justify-end">
            <div className="my-4 flex xl:items-center">
              <div className="flex grow flex-col">
                <NameAndCountry />
                <div className="xl:hidden">
                  <SexAndAge />
                </div>
              </div>
              <div className={clsx("hidden xl:flex", "mr-16")}>
                <Stats />
              </div>
              <Buttons />
            </div>
            <div className="hidden xl:block">
              <AboutAndTags />
            </div>
          </div>
        </div>
        <div className="flex gap-6 xl:hidden">
          <AboutAndTags />
          <Stats />
        </div>
      </div>
      <CalendarAndMedia />
    </div>
  );
}

export default Profile;
