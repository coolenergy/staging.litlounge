import { clsx } from "clsx";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide, useSwiperSlide } from "swiper/react";
import Image from "~/components/image";
import { apiQueryHooks } from "~/hooks/api-query-hooks";
import useBreakpointValue from "~/hooks/use-breakpoint-value";
import { ModelSearchResponse } from "~/utils/api";
import { calcAgeByBirth } from "~/utils/calc-age-by-birth";
import { consts } from "~/utils/consts";
import { createRange } from "~/utils/create-range";
import { paths } from "~/utils/paths";
import LocationSvg from "../location.svg";
import SlideToLeftSvg from "../slide-to-left.svg";
import ArrowPrevSvg from "./arrow-prev.svg";

const className = {
  slideButtonSlot: clsx("relative", "w-1/12"),
  navigationButton: clsx(
    "hover:use-shadow focus-visible:use-outline",
    "absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2",
    "h-10 w-10 rounded-full"
  ),
  paginationButton: clsx(
    "hover:use-shadow focus-visible:use-outline",
    "flex h-full items-center justify-center gap-2",
    "rounded-full border px-4"
  ),
  paginationArrow: "h-4 w-4",
};

function Slide({ model }: { model: ModelSearchResponse }) {
  const slide = useSwiperSlide();
  const modelPagePath = paths.model({ username: model.username });
  return (
    <div className="flex flex-col gap-2 p-2">
      <Link
        href={modelPagePath}
        className={clsx("focus-visible:use-outline", "relative overflow-hidden rounded-13")}
        tabIndex={slide.isVisible ? undefined : -1}
      >
        <Image
          src={model.avatar || consts.image.nothing}
          alt="Avatar"
          className="h-full w-full bg-my-light"
        />
      </Link>
      <Link
        href={modelPagePath}
        className={clsx(
          "mx-10 rounded-9 p-2",
          "bg-gradient-to-b from-black/0 to-black/50 backdrop-blur-md"
        )}
        tabIndex={-1}
      >
        <div className="flex place-content-between">
          <span className="whitespace-nowrap">{model.username}</span>
          <span className="whitespace-nowrap">{calcAgeByBirth(model.dateOfBirth)}</span>
        </div>
        <div className="flex place-content-center items-center gap-2">
          <LocationSvg className="h-3 w-3" />
          <span className="whitespace-nowrap text-12">{model.country}</span>
        </div>
      </Link>
    </div>
  );
}

function Slider() {
  const [swiper, setSwiper] = useState<SwiperClass>();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { data: models } = apiQueryHooks.useModels({});
  const pageSize = useBreakpointValue(4, {
    "3xl": 6,
  });
  if (models === undefined) {
    return null;
  }
  const slidesCount = models.data.length;
  const pagesCount = Math.ceil(slidesCount / pageSize) || 1;
  const currentPageIndex =
    currentSlideIndex >= slidesCount - pageSize // Are we on the last page?
      ? pagesCount - 1 // Use index of the last page
      : Math.floor(currentSlideIndex / pageSize); // Calculate page index
  return (
    <div className="flex flex-col">
      <div className="flex w-full">
        <div className={className.slideButtonSlot}>
          <button
            className={className.navigationButton}
            onClick={() => {
              swiper?.slidePrev();
            }}
          >
            <SlideToLeftSvg />
          </button>
        </div>
        <Swiper
          slidesPerView={pageSize}
          slidesPerGroup={pageSize}
          grabCursor
          watchSlidesProgress
          className="w-10/12"
          onSwiper={(swiper) => {
            setSwiper(swiper);
          }}
          onRealIndexChange={(swiper) => {
            setCurrentSlideIndex(swiper.realIndex);
          }}
        >
          {models?.data.map((model) => (
            <SwiperSlide key={model._id}>
              <Slide model={model} />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className={className.slideButtonSlot}>
          <button
            className={className.navigationButton}
            onClick={() => {
              swiper?.slideNext();
            }}
          >
            <SlideToLeftSvg className="-scale-100" />
          </button>
        </div>
      </div>
      <div className="flex h-10 w-full items-center justify-center gap-2">
        <button
          className={className.paginationButton}
          onClick={() => {
            swiper?.slidePrev();
          }}
        >
          <ArrowPrevSvg className={clsx(className.paginationArrow)} />
          Prev
        </button>
        {createRange(0, pagesCount).map((pageIndex) => (
          <button
            key={pageIndex}
            className={clsx(
              "hover:use-shadow focus-visible:use-outline",
              "flex h-10 w-10 items-center justify-center",
              "rounded-full border",
              pageIndex === currentPageIndex && "bg-my-purple"
            )}
            onClick={() => {
              swiper?.slideTo(pageSize * pageIndex);
            }}
          >
            {pageIndex + 1}
          </button>
        ))}
        <button
          className={className.paginationButton}
          onClick={() => {
            swiper?.slideNext();
          }}
        >
          Next
          <ArrowPrevSvg className={clsx(className.paginationArrow, "-scale-100")} />
        </button>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Slider), {
  ssr: false,
});
