import { clsx } from "clsx";
import MediaGrid, { MediaGridProps } from "~/components/media-grid";
import { createRange } from "~/utils/create-range";

const className = {
  button: ({ highlighted }: { highlighted?: boolean } = {}) =>
    clsx(
      "flex items-center justify-center rounded-10 py-1 px-4 cursor-pointer disabled:cursor-default",
      highlighted
        ? ["use-shadow", "bg-my-purple text-white"]
        : "border-my-purple border-2 text-my-purple"
    ),
};

function MediaNavigator({
  total = 0,
  pageIndex,
  setPageIndex,
  ...mediaGridProps
}: {
  total: number | undefined;
  pageIndex: number;
  setPageIndex: (value: number) => void;
} & MediaGridProps) {
  const { cols, rows } = mediaGridProps;
  const pageSize = cols * rows;
  const pagesCount = Math.ceil(total / pageSize) || 1;
  return (
    <div className="flex grow flex-col">
      <div className={clsx("relative flex grow", "justify-center xl:justify-end")}>
        <div className="absolute h-full w-full xl:w-3/5">
          <MediaGrid {...mediaGridProps} />
        </div>
      </div>
      <div className={clsx("my-8 flex gap-2", "justify-center xl:justify-end")}>
        <button
          className={className.button()}
          disabled={pageIndex <= 0}
          onClick={() => {
            setPageIndex(pageIndex - 1);
          }}
        >
          {"<"}
        </button>
        {createRange(0, pagesCount).map((index) => (
          <button
            key={index}
            className={className.button({ highlighted: index === pageIndex })}
            disabled={index === pageIndex}
            onClick={() => {
              setPageIndex(index);
            }}
          >
            {(index + 1).toString().padStart(2, "0")}
          </button>
        ))}
        <button
          className={className.button()}
          disabled={pageIndex >= pagesCount - 1}
          onClick={() => {
            setPageIndex(pageIndex + 1);
          }}
        >
          {">"}
        </button>
      </div>
    </div>
  );
}

export default MediaNavigator;
