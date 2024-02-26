import useSwr from "swr";
import { localStorageHooks } from "~/hooks/local-storage-hooks";
import {
  apiUtils,
  Me,
  Model,
  ModelGalleriesQueryParams,
  ModelGallery,
  ModelGalleryPhoto,
  ModelGalleryPhotosQueryParams,
  ModelQueryParams,
  ModelRelatedCamsQueryParams,
  ModelSearchResponse,
  ModelsQueryParams,
  ModelVideo,
  ModelVideosQueryParams,
} from "~/utils/api";
import { Conversation, Message } from "~/utils/api/dto/stream";
import { StreamChatMessagesQueryParams, StreamChatQueryParams } from "~/utils/api/urls";
import { PartialBy } from "~/utils/partial-by";

type PageableData<T> = {
  data: T[];
  total: number;
};

function useMe() {
  const [jwt] = localStorageHooks.useJwt();
  return useSwr<Me>(jwt && apiUtils.urls.me());
}

function useModels(params: ModelsQueryParams) {
  return useSwr<PageableData<ModelSearchResponse>>(apiUtils.urls.models(params));
}

function useModel({ username, ...otherParams }: PartialBy<ModelQueryParams, "username">) {
  return useSwr<Model>(username && apiUtils.urls.model({ username, ...otherParams }));
}

function useModelGalleries({
  performerId,
  ...otherParams
}: PartialBy<ModelGalleriesQueryParams, "performerId">) {
  return useSwr<PageableData<ModelGallery>>(
    performerId && apiUtils.urls.modelGalleries({ performerId, ...otherParams })
  );
}

function useModelGalleryPhotos({
  galleryId,
  ...otherParams
}: PartialBy<ModelGalleryPhotosQueryParams, "galleryId">) {
  return useSwr<PageableData<ModelGalleryPhoto>>(
    galleryId && apiUtils.urls.modelGalleryPhotos({ galleryId, ...otherParams })
  );
}

function useModelVideos({
  performerId,
  ...otherParams
}: PartialBy<ModelVideosQueryParams, "performerId">) {
  return useSwr<PageableData<ModelVideo>>(
    performerId && apiUtils.urls.modelVideos({ performerId, ...otherParams })
  );
}

function useModelRelatedCams({
  performerId,
  ...otherParams
}: PartialBy<ModelRelatedCamsQueryParams, "performerId">) {
  return useSwr<PageableData<ModelSearchResponse>>(
    performerId && apiUtils.urls.modelRelatedCams({ performerId, ...otherParams })
  );
}

function useStreamChat({ modelId }: PartialBy<StreamChatQueryParams, "modelId">) {
  return useSwr<Conversation>(modelId && apiUtils.urls.streamChat({ modelId }));
}

function useStreamChatMessages({
  conversationId,
  ...otherParams
}: PartialBy<StreamChatMessagesQueryParams, "conversationId">) {
  return useSwr<PageableData<Message>>(
    conversationId && apiUtils.urls.streamChatMessages({ conversationId, ...otherParams })
  );
}

export const apiQueryHooks = {
  useMe,
  useModels,
  useModel,
  useModelGalleries,
  useModelGalleryPhotos,
  useModelVideos,
  useModelRelatedCams,
  useStreamChat,
  useStreamChatMessages,
};
