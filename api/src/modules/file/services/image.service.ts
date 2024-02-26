import * as sharp from 'sharp';

export class ImageService {
  public async createThumbnail(filePath: string, options?: {
    width?: number;
    height?: number;
    toPath?: string;
  }) {
    // eslint-disable-next-line no-param-reassign
    options = options || {
      width: 200, // TODO - from config
      height: 200
    };
    // if (file.mimeType && !file.mimeType.includes('image')) {
    //   throw new InvalidImageException();
    // }

    if (options.toPath) {
      return sharp(filePath)
        .rotate()
        .resize(options.width, options.height)
        .toFile(options.toPath);
    }

    return sharp(filePath)
      .rotate()
      .resize(options.width, options.height)
      .toBuffer();
  }

  public async getMetaData(filePath: string) {
    return sharp(filePath).metadata();
  }

  public async replaceWithoutExif(filePath: string) {
    return sharp(filePath)
      .rotate()
      .toBuffer();
  }
}
