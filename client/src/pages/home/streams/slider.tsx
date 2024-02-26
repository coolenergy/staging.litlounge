import { clsx } from "clsx";
import Link from "next/link";
import { useState } from "react";
import { EffectCoverflow, Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide, useSwiperSlide } from "swiper/react";
import Image from "~/components/image";
import useBreakpointValue from "~/hooks/use-breakpoint-value";
import EyeSvg from "~/svgs/eye.svg";
import { ModelSearchResponse } from "~/utils/api";
import { consts } from "~/utils/consts";
import { paths } from "~/utils/paths";
import SlideToLeftSvg from "../slide-to-left.svg";
import BroadcastSvg from "./broadcast.svg";

const className = {
  slideButtonSlot: clsx("relative", "hidden xl:block", "w-1/12"),
  slideButton: clsx(
    "hover:use-shadow focus-visible:use-outline",
    "absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2",
    "h-10 w-10 rounded-full"
  ),
};

function Slide({ model }: { model: ModelSearchResponse }) {
  const slide = useSwiperSlide();
  return (
    <div className={clsx("relative h-full w-full", slide.isActive || "xl:pointer-events-none")}>
      <Link
        href={paths.model({ username: model.username })}
        className={clsx("group", "outline-none")}
        tabIndex={slide.isActive ? undefined : -1}
      >
        <Image
          src={model.avatar || consts.image.nothing}
          alt="Avatar"
          className={clsx(
            "group-focus-visible:use-outline",
            "h-full w-full",
            "rounded-full xl:rounded-10",
            "border-2 border-my-purple xl:border-none",
            "object-cover",
            "p-0.25 xl:p-0"
          )}
        />
        <div
          className={clsx(
            "absolute top-[calc(50%-sin(315deg)*50%)] left-[calc(50%+cos(315deg)*50%)] -translate-x-1/2 -translate-y-1/2",
            "xl:hidden",
            "h-3 w-3 rounded-full border-2 border-[#232323] bg-my-purple"
          )}
        />
        <div className="hidden xl:block">
          <div className={clsx("absolute top-2 right-2", "flex gap-2")}>
            <div
              className={clsx(
                "flex items-center gap-2 rounded-full px-2",
                "bg-black/30 backdrop-blur-md"
              )}
            >
              <EyeSvg className="h-4 w-4" />
              {model.stats.views}
            </div>
            <div className={clsx("flex items-center gap-2 rounded-full bg-[#ff0000] px-2")}>
              <BroadcastSvg className="h-3 w-3" />
              Live
            </div>
          </div>
          <div
            className={clsx(
              "absolute right-0 bottom-0 left-0 mx-8 mb-4",
              "flex items-center gap-2",
              "rounded-8 bg-gradient-to-b from-black/0 to-black/50  p-1 backdrop-blur-md"
            )}
          >
            <Image
              src={model.avatar || consts.image.nothing}
              alt="Avatar"
              className="h-10 w-10 rounded-full border object-cover"
            />
            <div>
              <div>{model.username}</div>
              <div>{model.country}</div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

const mobileSlideWidthInPixels = (1 + 16 + 1) * 4;

function Slider({ models }: { models: ModelSearchResponse[] }) {
  const isDesktop = useBreakpointValue(false, { xl: true });
  const [swiper, setSwiper] = useState<SwiperClass>();
  const [swiperWidth, setSwiperWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const mobileSlidesCount = Math.floor(swiperWidth / mobileSlideWidthInPixels);
  const mobileSlidesLastVisibleSlideIndex = activeIndex + mobileSlidesCount - 1;
  return (
    <div className="flex w-full">
      <div className={className.slideButtonSlot}>
        <button
          className={className.slideButton}
          onClick={() => {
            swiper?.slidePrev();
          }}
        >
          <SlideToLeftSvg />
        </button>
      </div>
      <Swiper
        slidesPerView="auto"
        initialSlide={isDesktop ? Math.floor(models.length / 2) : 0}
        centeredSlides={isDesktop}
        slideToClickedSlide={isDesktop}
        allowSlideNext={isDesktop}
        allowSlidePrev={isDesktop}
        allowTouchMove={isDesktop}
        grabCursor={isDesktop}
        modules={[EffectCoverflow]}
        effect={isDesktop ? "coverflow" : undefined}
        coverflowEffect={{
          rotate: 0,
          modifier: 2,
        }}
        className={clsx("h-16 xl:h-56 xl:!py-1", ["w-full xl:w-10/12"])}
        onSwiper={(swiper) => {
          setSwiper(swiper);
          setSwiperWidth(swiper.width);
          setActiveIndex(swiper.activeIndex);
        }}
        onResize={(swiper) => {
          setSwiperWidth(swiper.width);
        }}
        onActiveIndexChange={(swiper) => {
          setActiveIndex(swiper.activeIndex);
        }}
      >
        {models.map((model, index) => {
          return (
            <SwiperSlide
              key={model._id}
              className={clsx(
                "mx-1 !w-16 xl:!w-96",
                index > mobileSlidesLastVisibleSlideIndex && "invisible xl:visible"
              )}
            >
              {index === mobileSlidesLastVisibleSlideIndex ? (
                <div
                  className={clsx(
                    "flex xl:hidden",
                    "h-full w-full",
                    "grow items-center justify-center",
                    "text-13 text-my-purple"
                  )}
                  style={{
                    width: `${mobileSlideWidthInPixels}px`,
                  }}
                >
                  <Link href={paths.models}>View All</Link>
                </div>
              ) : (
                <Slide model={model} />
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className={className.slideButtonSlot}>
        <button
          className={className.slideButton}
          onClick={() => {
            swiper?.slideNext();
          }}
        >
          <SlideToLeftSvg className="-scale-100" />
        </button>
      </div>
    </div>
  );
}

export default Slider;
