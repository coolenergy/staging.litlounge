import { fetch } from "./fetch";
import { mutations } from "./mutations";
import { urls } from "./urls";

export type {
  Model,
  ModelGallery,
  ModelGalleryPhoto,
  ModelSchedule,
  ModelScheduleDay,
  ModelSearchResponse,
  ModelVideo,
} from "./dto/model";
export type { Me, User } from "./dto/user";
export type { AuthOutput, LogInInput, SignUpInput } from "./mutations";
export type {
  ModelGalleriesQueryParams,
  ModelGalleryPhotosQueryParams,
  ModelQueryParams,
  ModelRelatedCamsQueryParams,
  ModelsQueryParams,
  ModelVideosQueryParams,
} from "./urls";

export const apiUtils = {
  urls,
  fetch,
  mutations,
};
