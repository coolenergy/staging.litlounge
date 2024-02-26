import { GetServerSideProps, NextPage } from "next";
import { SWRConfig } from "swr";
import ModelPage from "~/pages/model";
import { ssrUtils, SwrFallbackProps } from "~/utils/ssr";

type Props = SwrFallbackProps;

export const getServerSideProps: GetServerSideProps<Props> = ssrUtils.go404IfBadUsername;

const Page: NextPage<Props> = ({ swrFallback }) => {
  return (
    <SWRConfig value={{ fallback: swrFallback }}>
      <ModelPage />
    </SWRConfig>
  );
};

export default Page;
