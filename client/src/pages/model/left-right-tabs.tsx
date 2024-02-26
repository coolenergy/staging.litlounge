import { clsx } from "clsx";

export type ModelLeftRightTab = "left" | "right";

function LeftRightTabs({
  leftTabTitle,
  rightTabTitle,
  selectedTab,
  setSelectedTab,
}: {
  leftTabTitle: string;
  rightTabTitle: string;
  selectedTab: "left" | "right";
  setSelectedTab: (value: "left" | "right") => void;
}) {
  return (
    <div className={clsx("grid grid-cols-2", "bg-[#D9D9D9]/5 py-2")}>
      <div
        className={clsx(
          "flex flex-1 justify-center",
          selectedTab === "left" ? "text-my-purple" : "text-white"
        )}
        onClick={() => setSelectedTab("left")}
      >
        {leftTabTitle}
      </div>
      <div
        className={clsx(
          "flex flex-1 justify-center",
          selectedTab === "right" ? "text-my-purple" : "text-white"
        )}
        onClick={() => setSelectedTab("right")}
      >
        {rightTabTitle}
      </div>
      <div className={clsx("flex justify-center", selectedTab === "right" && "col-start-2")}>
        <div className="h-1 w-4 rounded-full bg-my-purple" />
      </div>
    </div>
  );
}

export default LeftRightTabs;
