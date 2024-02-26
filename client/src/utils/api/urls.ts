const endpoints = {
  me: "users/me",
  modelsSearch: "/performers/search",
  model: ({ username }: { username: string }) => {
    return `performers/${username}/view`;
  },
  modelGalleriesSearch: "user/performer-assets/galleries/search",
  modelGalleryPhotosSearch: ({ galleryId }: { galleryId: string }) => {
    return `/user/performer-assets/photos/${galleryId}/search`;
  },
  modelVideosSearch: "/user/performer-assets/videos/search",
  streamChat: ({ modelId }: { modelId: string }) => {
    return `/conversations/stream/public/${modelId}`;
  },
  streamChatMessages: ({ conversationId }: { conversationId: string }) => {
    return `/messages/conversations/public/${conversationId}`;
  },
};

type QueryParam = string | false;

function buildQueryParam<T>(name: string, value: T): QueryParam {
  return value != null && value != "" && `${name}=${value}`;
}

type PaginationParams = {
  offset?: number;
  limit?: number;
};

function buildPaginationParams({ offset = 0, limit }: PaginationParams): QueryParam[] {
  return [buildQueryParam("offset", offset), buildQueryParam("limit", limit)];
}

function buildQueryString(params: QueryParam[]): string {
  return params.filter((param) => param).join("&");
}

export type ModelsQueryParams = PaginationParams & {
  query?: string;
};

export type ModelQueryParams = {
  username: string;
};

export type ModelGalleriesQueryParams = PaginationParams & {
  performerId: string;
};

export type ModelGalleryPhotosQueryParams = PaginationParams & {
  galleryId: string;
};

export type ModelVideosQueryParams = PaginationParams & {
  performerId: string;
};

export type ModelRelatedCamsQueryParams = PaginationParams & {
  performerId: string;
};

export type StreamChatQueryParams = {
  modelId: string;
};

export type StreamChatMessagesQueryParams = {
  conversationId: string;
};

export const urls = {
  me: () => {
    return endpoints.me;
  },
  models: ({ query, offset, limit }: ModelsQueryParams) => {
    return `${endpoints.modelsSearch}?${buildQueryString([
      buildQueryParam("q", query),
      ...buildPaginationParams({ offset, limit }),
    ])}`;
  },
  model: ({ username }: ModelQueryParams) => {
    return endpoints.model({ username });
  },
  modelGalleries: ({ performerId, offset, limit }: ModelGalleriesQueryParams) => {
    return `${endpoints.modelGalleriesSearch}?${buildQueryString([
      buildQueryParam("performerId", performerId),
      buildQueryParam("status", "active"),
      ...buildPaginationParams({ offset, limit }),
    ])}`;
  },
  modelGalleryPhotos: ({ galleryId, offset, limit }: ModelGalleryPhotosQueryParams) => {
    return `${endpoints.modelGalleryPhotosSearch({ galleryId })}?${buildQueryString([
      buildQueryParam("status", "active"),
      ...buildPaginationParams({ offset, limit }),
    ])}`;
  },
  modelVideos: ({ performerId, offset, limit }: ModelVideosQueryParams) => {
    return `${endpoints.modelVideosSearch}?${buildQueryString([
      buildQueryParam("performerId", performerId),
      buildQueryParam("status", "active"),
      ...buildPaginationParams({ offset, limit }),
    ])}`;
  },
  modelRelatedCams: ({ performerId, offset, limit }: ModelRelatedCamsQueryParams) => {
    return `${endpoints.modelsSearch}?${buildQueryString([
      buildQueryParam("excludedId", performerId),
      buildQueryParam("status", "active"),
      ...buildPaginationParams({ offset, limit }),
    ])}`;
  },
  streamChat: (params: StreamChatQueryParams) => {
    return endpoints.streamChat(params);
  },
  streamChatMessages: ({ conversationId }: StreamChatMessagesQueryParams) => {
    return `${endpoints.streamChatMessages({ conversationId })}?${buildQueryString([
      buildQueryParam("sort", "desc"),
    ])}`;
  },
};
