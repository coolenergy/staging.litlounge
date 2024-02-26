import { Entity } from "./entity";

type ModelScheduleDay = {
  start: string;
  end: string;
  closed: boolean;
};

type ModelSchedule = {
  mon: ModelScheduleDay;
  tue: ModelScheduleDay;
  wed: ModelScheduleDay;
  thu: ModelScheduleDay;
  fri: ModelScheduleDay;
  sat: ModelScheduleDay;
  sun: ModelScheduleDay;
};

type ModelStats = {
  views?: number;
  favorites?: number;
  totalVideos?: number;
  totalPhotos?: number;
  totalGalleries?: number;
  totalProducts?: number;
  totalStreamTime?: number;
  totalTokenEarned?: number;
  totalTokenSpent?: number;
};

type ModelSearchResponse = Entity & {
  aboutMe?: string;
  avatar: string;
  categories?: string[];
  categoryIds?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: string;
  groupCallPrice: number;
  header: string;
  isBlocked?: boolean;
  isFavorite: boolean;
  isOnline?: boolean;
  isStreaming?: boolean;
  languages?: string[];
  lastStreamingTime: string;
  offlineAt?: string;
  privateCallPrice: number;
  stats: ModelStats;
  streamingStatus?: string;
  streamingTitle?: string;
  tags?: string[];
  username: string;
  watching?: number;
};

type Model = ModelSearchResponse & {
  address?: string;
  bio?: string;
  bust?: string;
  city?: string;

  createdAt?: Date;
  ethnicity?: string;
  eyes?: string;
  hair?: string;
  height?: string;
  maxParticipantsAllowed?: number;
  monthlyPrice?: number;
  noteForUser?: string;
  onlineAt?: Date;
  pubicHair?: string;
  schedule: ModelSchedule;
  sexualReference?: string;
  socials: any;
  state?: string;
  status?: string;
  timezone?: string;
  updatedAt?: Date;
  weight?: string;
  yearlyPrice?: number;
  zipcode?: string;
};

type ModelGallery = Entity & {
  performerId?: string;
  type?: string;
  name?: string;
  description?: string;
  status?: string;
  processing?: boolean;
  coverPhotoId?: string;
  token?: number;
  coverPhoto?: {
    thumbnails: string[];
  };
  isBought?: boolean;
  performer?: any;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isSale?: boolean;
};

type ModelGalleryPhoto = Entity & {
  performerId?: string;
  galleryId?: string;
  fileId?: string;
  photo?: {
    url?: string;
  };
  type?: string;
  title?: string;
  description?: string;
  status?: string;
  processing?: boolean;
  performer?: any;
  gallery?: any;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type ModelVideo = Entity & {
  performerId?: string;
  fileId?: string;
  type?: string;
  title?: string;
  description?: string;
  status?: string;
  processing?: boolean;
  thumbnailId?: string;
  token?: number;
  isBought?: boolean;
  thumbnail?: string;
  video?: {
    thumbnails?: string[];
    url?: string;
  };
  trailer?: any;
  trailerId?: string;
  isSaleVideo?: boolean;
  performer?: any;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type {
  ModelSchedule,
  ModelScheduleDay,
  ModelSearchResponse,
  Model,
  ModelGallery,
  ModelGalleryPhoto,
  ModelVideo,
};
