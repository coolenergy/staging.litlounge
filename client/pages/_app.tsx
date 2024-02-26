import "~/styles/globals.css";

import "swiper/css";

import dayjs from "dayjs";
import "dayjs/locale/en";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
const inSeconds = "just now";
dayjs.updateLocale("en", {
  relativeTime: {
    future: (s: string) => {
      return s === inSeconds ? s : `in ${s}`;
    },
    past: (s: string) => {
      return s === inSeconds ? s : `${s} ago`;
    },
    s: inSeconds,
    m: "a min",
    mm: "%d mins",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

import type { AppProps } from "next/app";
import Head from "next/head";
import { useMemo, useState } from "react";
import { SWRConfig } from "swr";
import * as uuid from "uuid";
import AppAuthDialog from "~/components/app-auth-dilalog";
import { AppAuthDialogOpenState } from "~/components/app-auth-dilalog/app-auth-dialog";
import AppBuyTokensDialog from "~/components/app-buy-tokens-dialog";
import AppContext from "~/components/app-context";
import AppDrawer from "~/components/app-drawer";
import AppNotifications, { NotificationState } from "~/components/app-notifications";
import AppUserMenuDialog from "~/components/app-user-menu-dialog";
import { useDarkModeSupport } from "~/hooks/use-dark-mode-support";
import { apiUtils } from "~/utils/api";

function App({ Component, pageProps }: AppProps) {
  useDarkModeSupport();
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [isSignUpDialogOpen, setSignUpDialogOpen] = useState<AppAuthDialogOpenState>(false);
  const [isLoginDialogOpen, setLoginDialogOpen] = useState<AppAuthDialogOpenState>(false);
  const [isUserMenuDialogOpen, setUserMenuDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBuyTokensModalOpen, setBuyTokensModalOpen] = useState(false);
  return (
    <AppContext.Provider
      value={useMemo(
        () => ({
          pushNotification: (data) => {
            setNotifications((notifications) => [
              ...notifications,
              {
                id: uuid.v4(),
                show: true,
                definition: data,
              },
            ]);
          },
          isLoginDialogOpen,
          setLoginDialogOpen,
          isUserMenuDialogOpen,
          setUserMenuDialogOpen,
          searchQuery,
          setSearchQuery,
          openBuyTokensDialog: () => {
            setBuyTokensModalOpen(true);
          },
        }),
        [isLoginDialogOpen, isUserMenuDialogOpen, searchQuery]
      )}
    >
      <SWRConfig
        value={{
          fetcher: apiUtils.fetch,
        }}
      >
        <Head>
          <title>LitLounge</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
        <AppDrawer />
        <AppAuthDialog
          open={isSignUpDialogOpen}
          setOpen={setSignUpDialogOpen}
          type="signup"
          onSwitchType={(openState) => {
            setSignUpDialogOpen(false);
            setLoginDialogOpen(openState);
          }}
        />
        <AppAuthDialog
          open={isLoginDialogOpen}
          setOpen={setLoginDialogOpen}
          type="login"
          onSwitchType={(openState) => {
            setLoginDialogOpen(false);
            setSignUpDialogOpen(openState);
          }}
        />
        <AppUserMenuDialog open={isUserMenuDialogOpen} setOpen={setUserMenuDialogOpen} />
        <AppBuyTokensDialog open={isBuyTokensModalOpen} setOpen={setBuyTokensModalOpen} />
        <AppNotifications notifications={notifications} setNotifications={setNotifications} />
      </SWRConfig>
    </AppContext.Provider>
  );
}

export default App;
