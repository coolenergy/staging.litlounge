import { clsx } from "clsx";
import { useState } from "react";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import { chooseBy } from "~/utils/choose-by";
import { consts } from "~/utils/consts";
import AboutAndTags from "../about-and-tags";
import Buttons from "../buttons";
import LeftRightTabs, { ModelLeftRightTab } from "../left-right-tabs";
import NameAndCountry from "../name-and-country";
import PageContext from "../page-context";
import SexAndAge from "../sex-and-age";
import Stats from "../stats";
import Chat from "./chat";
import ChevronRightSvg from "./chevron-right.svg";
import Player from "./player";
import SlideOver, { SlideOverTransition } from "./slide-over";
import TipMenu from "./tip-menu";

function ChatAndTipMenu() {
  const page = useContextOrThrow(PageContext);
  const [isTipMenuHiddenInFullScreen, setTipMenuHiddenInFullScreen] = useState(true);
  const [selectedTab, setSelectedTab] = useState<ModelLeftRightTab>("left");
  return (
    <>
      <div className={clsx("flex xl:hidden", "min-h-0 grow flex-col")}>
        <LeftRightTabs
          leftTabTitle="Chat"
          rightTabTitle="Tips"
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
        {chooseBy(selectedTab, {
          left: <Chat setTipMenuHidden={setTipMenuHiddenInFullScreen} />,
          right: (
            <TipMenu
              hiddenInDesktopFullScreen={isTipMenuHiddenInFullScreen}
              setHiddenInDesktopFullScreen={setTipMenuHiddenInFullScreen}
            />
          ),
        })}
      </div>
      <div
        className={clsx(
          page.isStreamInFullScreen ? "absolute right-8 bottom-8 left-1/3" : "static",
          "hidden xl:flex",
          "h-full",
          page.isStreamInFullScreen ? "max-h-96" : "min-h-0",
          page.isStreamInFullScreen ? "flex-row" : "flex-col 3xl:flex-row",
          page.isStreamInFullScreen ? "justify-end" : "items-end 3xl:items-stretch 3xl:justify-end",
          page.isStreamInFullScreen ? "gap-4" : "gap-0 3xl:gap-16"
        )}
      >
        <TipMenu
          hiddenInDesktopFullScreen={isTipMenuHiddenInFullScreen}
          setHiddenInDesktopFullScreen={setTipMenuHiddenInFullScreen}
        />
        <Chat setTipMenuHidden={setTipMenuHiddenInFullScreen} />
      </div>
    </>
  );
}

function Stream() {
  const page = useContextOrThrow(PageContext);
  const [isSideOverOpen, setSlideOverOpen] = useState(false);
  const [slideOverTransition, setSlideOverTransition] = useState<SlideOverTransition>();
  return (
    <>
      <div
        className={clsx(
          "flex min-h-0 grow",
          "flex-col xl:flex-row",
          "gap-1 xl:gap-10 3xl:gap-16",
          "xl:mr-8 3xl:mr-16"
        )}
      >
        <div
          className={clsx(
            "flex",
            "h-1/3 xl:h-auto",
            "w-full xl:w-auto",
            "shrink-0 xl:shrink",
            "xl:grow",
            "flex-col"
          )}
        >
          <Player />
        </div>
        <div
          className={clsx(
            page.isStreamInFullScreen && "hidden xl:block",
            "flex min-h-0 grow flex-col"
          )}
        >
          <div className={clsx("flex xl:hidden", "gap-4 bg-[#D9D9D9]/15 py-2 px-4")}>
            <img
              src={page.model ? page.model.avatar || consts.image.nothing : consts.image.waiting}
              alt="Avatar"
              className={clsx("h-12 w-12 xl:h-36 xl:w-36", "rounded-full bg-white object-cover")}
            />
            <div className="flex grow items-center gap-4">
              <NameAndCountry />
              <SexAndAge />
            </div>
            <Stats />
          </div>
          <div className={clsx("xl:hidden", "bg-[#D9D9D9]/15 py-2 px-4")}>
            <Buttons />
          </div>
          <div className={clsx("flex h-full min-h-0 grow flex-col xl:grow-0")}>
            <div className={clsx("xl:hidden", "py-2 px-4")}>
              <AboutAndTags />
            </div>
            <ChatAndTipMenu />
          </div>
        </div>
      </div>
      {page.isStreamInFullScreen && (
        <div className="xl:hidden">
          <button
            className={clsx(
              "absolute inset-y-0 right-0",
              isSideOverOpen ? "hidden" : slideOverTransition ? "hidden" : "flex",
              "items-center outline-none"
            )}
            onClick={() => {
              setSlideOverOpen(!isSideOverOpen);
            }}
          >
            <ChevronRightSvg className="h-4 w-4 -scale-100" />
          </button>
          <SlideOver
            open={isSideOverOpen}
            setOpen={setSlideOverOpen}
            onTransitionStateChange={(value) => {
              setSlideOverTransition(value);
            }}
          >
            <div className="flex min-h-0 grow flex-col bg-[#232323]/50">
              <div className={clsx("flex xl:hidden", "gap-4", "py-2 px-4")}>
                <img
                  src={page.model ? page.model.avatar : consts.image.waiting}
                  alt="Avatar"
                  className={clsx(
                    "h-12 w-12 xl:h-36 xl:w-36",
                    "rounded-full bg-white object-cover"
                  )}
                />
                <NameAndCountry />
                <Buttons />
              </div>
              <ChatAndTipMenu />
            </div>
          </SlideOver>
        </div>
      )}
    </>
  );
}

export default Stream;
