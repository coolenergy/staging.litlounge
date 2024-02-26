import { GetServerSideProps, NextPage } from "next";
import { SWRConfig } from "swr";
import VideosPage from "~/pages/videos";
import { ssrUtils, SwrFallbackProps } from "~/utils/ssr";

type Props = SwrFallbackProps;

export const getServerSideProps: GetServerSideProps<Props> = ssrUtils.go404IfBadUsername;

const Page: NextPage<Props> = ({ swrFallback }) => {
  return (
    <SWRConfig value={{ fallback: swrFallback }}>
      <VideosPage />
    </SWRConfig>
  );
};

export default Page;
