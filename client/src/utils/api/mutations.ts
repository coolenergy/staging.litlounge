import { AxiosResponse } from "axios";
import { chooseBy } from "~/utils/choose-by";
import { api } from "./api";
import { Response } from "./response";

const endpoints = {
  sigup: "auth/users/register",
  loginByEmail: "auth/users/login",
  loginByUsername: "auth/users/login/username",
  likeModel: ({ id }: { id: string }) => `favourite/${id}/like`,
  unlikeModel: ({ id }: { id: string }) => `favourite/${id}/unlike`,
  sendChatMessage: ({ conversationId }: { conversationId: string }) => {
    return `messages/stream/public/conversations/${conversationId}`;
  },
};

function getDataOrThrow<Data>(axiosResponse: AxiosResponse<Response<Data>>): Data {
  const { data } = axiosResponse.data;
  if (data == null) {
    throw Error("No data received");
  }
  return data;
}

export type AuthOutput = {
  token: string;
};

export type SignUpInput = {
  username: string;
  email: string;
  password: string;
};

async function signUp({ username, email, password }: SignUpInput): Promise<AuthOutput> {
  const response = await api.post<Response<AuthOutput>>(endpoints.sigup, {
    username,
    email,
    password,
  });
  return getDataOrThrow(response);
}

export type LogInInput = {
  login: string;
  password: string;
};

async function logIn({ login, password }: LogInInput): Promise<AuthOutput> {
  const type = login.includes("@") ? "email" : "username";
  const response = await api.post<Response<AuthOutput>>(
    chooseBy(type, {
      email: endpoints.loginByEmail,
      username: endpoints.loginByUsername,
    }),
    {
      [type]: login,
      password,
    }
  );
  return getDataOrThrow(response);
}

export type LikeModelInput = {
  id: string;
  value: boolean;
};

async function likeModel({ id, value }: LikeModelInput): Promise<void> {
  if (value === true) {
    await api.post<Response<void>>(endpoints.likeModel({ id }));
  } else {
    await api.post<Response<void>>(endpoints.unlikeModel({ id }));
  }
}

export type SendChatMessageInput = {
  conversationId: string;
  text: string;
};

async function sendChatMessage({ conversationId, text }: SendChatMessageInput): Promise<void> {
  await api.post<Response<void>>(endpoints.sendChatMessage({ conversationId }), {
    text,
  });
}

export const mutations = {
  signUp,
  logIn,
  likeModel,
  sendChatMessage,
};
