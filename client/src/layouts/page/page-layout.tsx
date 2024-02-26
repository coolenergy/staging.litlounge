import { clsx } from "clsx";
import { ReactNode } from "react";
import Footer from "./footer";
import Header from "./header";

const className = {
  bgImg: "absolute inset-0 -z-10 h-full w-full object-cover bg-my-background",
};

function Bg({
  mobileSrc = "/bg-mobile.jpg",
  desktopSrc = "/bg-desktop.jpg",
}: {
  mobileSrc?: string;
  desktopSrc?: string;
}) {
  return (
    <>
      <img
        src={mobileSrc}
        alt=""
        className={clsx(className.bgImg, "xl:hidden", "object-right-top")}
      />
      <img
        src={desktopSrc}
        alt=""
        className={clsx(className.bgImg, "hidden xl:block", "object-left")}
      />
    </>
  );
}

function PageLayout({
  bg,
  headerOnMobile = true,
  headerOnDesktop = true,
  hero,
  children,
  footerOnMobile = true,
  footerOnDesktop = true,
  style,
}: {
  bg?: [mobileSrc: string] | [mobileSrc: string, desktopSrc: string] | ReactNode;
  headerOnMobile?: boolean | "above";
  headerOnDesktop?: boolean | "above";
  hero?: ReactNode;
  children: ReactNode;
  footerOnMobile?: boolean | "above";
  footerOnDesktop?: boolean | "above";
  style?: {
    limitLandscapeHeight?: boolean;
  };
}) {
  return (
    <div
      className={clsx(
        "flex",
        [
          // to ensure page height is equal to screen height on mobiles/tablets
          "h-[100vh] xl:h-auto", // fallback for "max-h-[100svh] xl:max-h-none", if svh isn't supported
          "max-h-[100svh] xl:max-h-none",
        ],
        [
          // to ensure min page height is equal to screen height on all screens
          "min-h-[100vh]", // fallback for the minHeight: "100svh" style, if svh isn't supported
        ],
        "flex-col",
        "overflow-visible" // if content overflows, e.g. on mobiles in landscape, it should be visible
      )}
      style={{ minHeight: "100svh" }}
    >
      <div
        className={clsx(
          "flex",
          "portrait:min-h-0",
          style?.limitLandscapeHeight ? "landscape:max-h-[200vh]" : "landscape:max-h-max",
          "xl:landscape:max-h-none",
          "grow flex-col"
        )}
      >
        <div className={clsx("relative flex min-h-0 grow flex-col", "text-white")}>
          {bg ? !Array.isArray(bg) ? bg : <Bg mobileSrc={bg[0]} desktopSrc={bg[1]} /> : <Bg />}
          <div
            className={clsx("flex", hero && "h-screen grow", "flex-col", [
              headerOnMobile === true ? "pt-24" : "pt-0",
              headerOnDesktop === true ? "xl:pt-52 3xl:pt-80" : "xl:pt-0 3xl:pt-0",
            ])}
            style={{ ...(hero && { height: "100svh" }) }}
          >
            {hero}
          </div>
          <div
            className={clsx("flex min-h-0 grow flex-col", [
              footerOnMobile === true ? "pb-0" : "pb-0",
              footerOnDesktop === true ? "xl:pb-14" : "xl:pb-0",
            ])}
          >
            {children}
          </div>
          <div
            className={clsx(
              [
                headerOnMobile ? "absolute" : "static",
                headerOnDesktop ? "xl:absolute" : "xl:static",
                "inset-0 bottom-auto",
              ],
              [
                headerOnMobile ? "flex" : "hidden",
                headerOnDesktop ? "xl:flex" : "xl:hidden",
                "flex-col",
              ]
            )}
          >
            <Header />
          </div>
          <div
            className={clsx(
              [
                footerOnMobile ? "absolute" : "static",
                footerOnDesktop ? "xl:absolute" : "xl:static",
                "inset-0 top-auto",
              ],
              [
                footerOnMobile ? "flex" : "hidden",
                footerOnDesktop ? "xl:flex" : "xl:hidden",
                "flex-col",
              ]
            )}
          >
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageLayout;
