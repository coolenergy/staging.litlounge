import { GetServerSideProps, NextPage } from "next";
import { SWRConfig } from "swr";
import GalleriesPage from "~/pages/galleries";
import { ssrUtils, SwrFallbackProps } from "~/utils/ssr";

type Props = SwrFallbackProps;

export const getServerSideProps: GetServerSideProps<Props> = ssrUtils.go404IfBadUsername;

const Page: NextPage<Props> = ({ swrFallback }) => {
  return (
    <SWRConfig value={{ fallback: swrFallback }}>
      <GalleriesPage />
    </SWRConfig>
  );
};

export default Page;
