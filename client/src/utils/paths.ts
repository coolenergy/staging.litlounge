export const paths = {
  home: "/",
  termsAndConditions: "/terms-and-conditions",
  privacyPolicy: "/privacy-policy",
  about: "/about",
  models: "/models",
  model: ({ username }: { username: string }) => {
    return `/models/${username}`;
  },
  modelGalleries: ({ username }: { username: string }) => {
    return `/models/${username}/galleries`;
  },
  galleryPhotos: ({ galleryId }: { galleryId: string }) => {
    return `/galleries/${galleryId}`;
  },
  modelVideos: ({ username }: { username: string }) => {
    return `/models/${username}/videos`;
  },
};
