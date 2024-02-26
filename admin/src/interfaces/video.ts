export interface IVideo {
  _id: string;
  title: string;
  performerId: string;
  token: number;
  status: string;
  description: string;
}

export interface IVideoCreate {
  title: string;
  performerId: string;
  token: number;
  status: string;
  description: string;
}

export interface IVideoUpdate {
  _id: string;
  performerId: string;
  title?: string;
  token?: number;
  status?: string;
  description?: string;
  thumbnail?: string;
  video?: { url: string; thumbnails: string[] };
  performer?: { username: string };
  isSaleVideo?: boolean;
}
