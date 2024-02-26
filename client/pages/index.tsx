import type { NextPage } from "next";
import { localStorageHooks } from "~/hooks/local-storage-hooks";
import HomePage from "~/pages/home";
import LandingPage from "~/pages/landing";

const Page: NextPage = () => {
  const [isAgreed] = localStorageHooks.useIsAgreed();
  return isAgreed ? <HomePage /> : <LandingPage />;
};

export default Page;
