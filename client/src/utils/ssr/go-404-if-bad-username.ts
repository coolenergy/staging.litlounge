import { AxiosError, HttpStatusCode } from "axios";
import { GetServerSideProps } from "next";
import { apiUtils, Model } from "~/utils/api";
import { getParam } from "~/utils/get-param";
import { SwrFallbackProps } from "./swr-fallback-props";

export const go404IfBadUsername: GetServerSideProps<SwrFallbackProps> = async (context) => {
  const username = getParam(context.params, "username") ?? "";
  const modelUrl = apiUtils.urls.model({
    username,
  });
  let model;
  try {
    model = await apiUtils.fetch<Model>(modelUrl);
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === HttpStatusCode.NotFound) {
      return {
        notFound: true,
      };
    }
  }
  return {
    props: {
      swrFallback: {
        [modelUrl]: model,
      },
    },
  };
};
