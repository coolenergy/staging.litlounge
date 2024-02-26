export type MediaObject = {
  coverUrl: string | undefined;
  linkUrl?: string;
} & (
  | {
      type: "gallery" | "image" | "video";
    }
  | {
      type: "cam";
      name: string;
      age: number | string;
      country: string;
    }
);
