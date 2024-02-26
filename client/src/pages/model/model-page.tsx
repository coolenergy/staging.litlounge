import { clsx } from "clsx";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { apiQueryHooks } from "~/hooks/api-query-hooks";
import useBreakpointValue from "~/hooks/use-breakpoint-value";
import PageLayout from "~/layouts/page";
import { calcAgeByBirth } from "~/utils/calc-age-by-birth";
import { consts } from "~/utils/consts";
import { getParam } from "~/utils/get-param";
import PageContext from "./page-context";
import Profile from "./profile";
import Stream from "./stream";

function Background() {
  return <div className="absolute inset-0 -z-10 bg-my-background" />;
}

function ModelPage() {
  const router = useRouter();
  const username = getParam(router.query, "username");
  const { data: model, isValidating: isModelValidation } = apiQueryHooks.useModel({
    username,
  });
  const isOnline = !!model?.isOnline;
  const [isStreamInFullScreen, setStreamInFullScreen] = useState(false);
  const isNormalDesktop = useBreakpointValue(false, { xl: true, "3xl": false });
  return (
    <PageContext.Provider
      value={useMemo(
        () => ({
          model,
          modelAge: model
            ? calcAgeByBirth(model.dateOfBirth) ?? consts.text.nothing
            : consts.text.waiting,
          modelHeader: model ? model.header || consts.image.nothing : consts.image.waiting,
          modelAvatar: model ? model.avatar || consts.image.nothing : consts.image.waiting,
          isModelValidation,
          isStreamInFullScreen,
          setStreamInFullScreen,
        }),
        [model, isModelValidation, isStreamInFullScreen]
      )}
    >
      <PageLayout
        bg={<Background />}
        headerOnMobile={"above"}
        headerOnDesktop={isOnline ? !isStreamInFullScreen : "above"}
        hero={isNormalDesktop && isOnline && <Stream />}
        footerOnMobile={!isStreamInFullScreen}
        footerOnDesktop={!isStreamInFullScreen}
        style={{
          limitLandscapeHeight: true,
        }}
      >
        {!isNormalDesktop && isOnline && (
          <div className={clsx("flex min-h-0", "grow xl:flex-initial", "3xl:h-[60vh]")}>
            <Stream />
          </div>
        )}
        {!isStreamInFullScreen && (
          <div className={clsx([isOnline ? "hidden xl:flex" : "flex", "min-h-0 grow flex-col"])}>
            <Profile />
          </div>
        )}
      </PageLayout>
    </PageContext.Provider>
  );
}

export default dynamic(() => Promise.resolve(ModelPage), {
  ssr: false,
});
