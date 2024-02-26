import { AxiosError, HttpStatusCode } from "axios";
import { useCallback } from "react";
import { mutate } from "swr";
import AppContext from "~/components/app-context";
import { localStorageHooks } from "~/hooks/local-storage-hooks";
import { useContextOrThrow } from "~/hooks/use-context-or-throw";
import { apiUtils, AuthOutput, LogInInput, Model, SignUpInput } from "~/utils/api";
import { SendChatMessageInput } from "~/utils/api/mutations";

function useMutation<Args = void, Output = void>({
  mutation,
  onSuccess,
  onError,
}: {
  mutation: (args: Args) => Promise<Output>;
  onSuccess: (output: Output, arg: Args) => void;
  onError: (error: AxiosError<{ message?: string }>, args: Args) => void;
}) {
  const app = useContextOrThrow(AppContext);
  return useCallback(
    async function mutate(args: Args) {
      try {
        const output = await mutation(args);
        onSuccess?.(output, args);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === HttpStatusCode.Forbidden) {
            app.setLoginDialogOpen(true);
          } else {
            onError?.(error, args);
          }
        } else {
          console.error(error);
          app.pushNotification({
            type: "warning",
            title: "Unexpected error",
            text: "Details are in the browser's console",
          });
        }
      }
    },
    [app.pushNotification, mutation, onSuccess, onError]
  );
}

type UseMutationOptions = {
  onSuccess?: () => void;
};

function useSignUp({ onSuccess }: UseMutationOptions = {}) {
  const { pushNotification } = useContextOrThrow(AppContext);
  return useMutation<SignUpInput, AuthOutput>({
    mutation: useCallback(async ({ username, email, password }) => {
      return apiUtils.mutations.signUp({
        username,
        email,
        password,
      });
    }, []),
    onSuccess: useCallback(() => {
      pushNotification({
        title: "Registration successful!",
        text: "Check your email to verify it",
      });
      onSuccess?.();
    }, [pushNotification, onSuccess]),
    onError: useCallback(
      (error) => {
        pushNotification({
          type: "warning",
          title: `Failed to register`,
          text: error.response?.data?.message,
        });
      },
      [pushNotification]
    ),
  });
}

function useLogIn({ onSuccess }: UseMutationOptions = {}) {
  const { pushNotification } = useContextOrThrow(AppContext);
  const [_, setJwt] = localStorageHooks.useJwt();
  return useMutation<LogInInput, AuthOutput>({
    mutation: useCallback(async ({ login, password }) => {
      return apiUtils.mutations.logIn({ login, password });
    }, []),
    onSuccess: useCallback(
      ({ token: jwt }) => {
        setJwt(jwt);
        onSuccess?.();
      },
      [setJwt, onSuccess]
    ),
    onError: useCallback(
      (error) => {
        pushNotification({
          type: "warning",
          title: `Failed to log in`,
          text: error.response?.data?.message,
        });
      },
      [pushNotification]
    ),
  });
}

function useLikeModel({ onSuccess }: UseMutationOptions = {}) {
  const { pushNotification } = useContextOrThrow(AppContext);
  return useMutation<{
    model: Model;
    value: boolean;
  }>({
    mutation: useCallback(async ({ model, value }) => {
      return apiUtils.mutations.likeModel({ id: model._id, value });
    }, []),
    onSuccess: useCallback(
      async (_, { model, value }) => {
        await mutate<Model>(apiUtils.urls.model({ username: model.username }), {
          ...model,
          isFavorite: value,
        });
        onSuccess?.();
      },
      [onSuccess]
    ),
    onError: useCallback(
      (error) => {
        pushNotification({
          type: "warning",
          title: "Failed to like",
          text: error.response?.data?.message,
        });
      },
      [pushNotification]
    ),
  });
}

function useSendChatMessage({ onSuccess }: UseMutationOptions = {}) {
  const { pushNotification } = useContextOrThrow(AppContext);
  return useMutation<SendChatMessageInput>({
    mutation: useCallback(async ({ conversationId, text }) => {
      return apiUtils.mutations.sendChatMessage({ conversationId, text });
    }, []),
    onSuccess: useCallback(
      async (_, { conversationId }) => {
        await mutate<Model>(apiUtils.urls.streamChatMessages({ conversationId }));
        onSuccess?.();
      },
      [onSuccess]
    ),
    onError: useCallback(
      (error) => {
        pushNotification({
          type: "warning",
          title: "Failed to send chat message",
          text: error.response?.data?.message,
        });
      },
      [pushNotification]
    ),
  });
}

export const apiMutationHooks = {
  useSignUp,
  useLogIn,
  useLikeModel,
  useSendChatMessage,
};
