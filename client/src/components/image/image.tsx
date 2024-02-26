import NextImage, { ImageLoader, ImageProps } from "next/image";

export const imageLoader: ImageLoader = ({ src }) => src;

function Image({ width, height, ...props }: Omit<ImageProps, "loader" | "unoptimized">) {
  // Width and hight are set to zero by default, because they are supposed to be specified via CSS
  return (
    <NextImage
      loader={imageLoader}
      unoptimized
      width={width ?? 0}
      height={height ?? 0}
      {...props}
    />
  );
}

export default Image;
