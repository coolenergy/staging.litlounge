import { exec } from 'child_process';
import * as Ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import { StringHelper } from 'src/kernel';
import { ConvertMp4ErrorException } from '../exceptions';

export interface IConvertOptions {
  toPath?: string;
  size?: string; // https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#video-frame-size-options
}

export interface IConvertResponse {
  fileName: string;
  toPath: string;
}

export class VideoService {
  public async convert2Mp4(
    filePath: string,
    options = {} as IConvertOptions
  ): Promise<IConvertResponse> {
    try {
      const fileName = `${StringHelper.randomString(5)}_${StringHelper.getFileName(filePath, true)}.mp4`;
      const toPath = options.toPath || join(StringHelper.getFilePath(filePath), fileName);

      return new Promise((resolve, reject) => {
        // have error, we have to build manually command line
        // eslint-disable-next-line new-cap
        // const command = new ffmpeg(filePath)
        //   // set target codec
        //   .videoCodec('libx264')
        //   // .addOption('-vf', 'scale=2*trunc(iw/2):-2')
        //   // QuickTime compatibility, Note: Requires dimensions to be divisible by 2.
        //   .outputOptions('-pix_fmt yuv420p')
        //   // All device compatibility, Android in particular doesn't support higher profiles.
        //   .outputOptions('-profile:v baseline -level 3.0')
        //   // Quality 0 is lossless, 23 is default, and 51 is worst possible. 18-28 is a sane range.
        //   // .outputOptions('-crf 20')
        //   // Fast start, Moves some data to the beginning of the file, allowing the video to be played before it is completely downloaded.
        //   .outputOptions('-movflags +faststart')
        //   .outputOptions('-strict experimental')
        //   // compress file: ultrafast, superfast, veryfast, fast, medium, slow, slower, veryslow
        //   .outputOptions('-preset fast')
        //   // Faster processing Flag: -threads 0, Allow your CPU to use an optimal number of threads.
        //   .outputOptions('-threads 0')
        //   .on('end', () => resolve({
        //     fileName,
        //     toPath
        //   }))
        //   .on('error', reject)
        //   .toFormat('mp4');

        // if (options.size) {
        //   command.size(options.size);
        // }
        // // save to file
        // command.save(toPath);

        let outputOptions = '-vcodec libx264 -pix_fmt yuv420p -profile:v baseline -level 3.0 -movflags +faststart -strict experimental -preset fast -threads 0';
        if (options.size) {
          const sizes = options.size.split('x');
          const width = sizes[0];
          // retain aspect ratio just give height as -1 and it will automatically resize based on the width
          const height = sizes.length > 1 ? sizes[1] : '-1  ';
          outputOptions += ` -vf scale="${width}:${height}"`;
        }

        const command = `ffmpeg -i ${filePath} ${outputOptions} ${toPath}`;
        exec(command, (err) => {
          if (err) {
            return reject(err);
          }
          return resolve({
            fileName,
            toPath
          });
        });
      });
    } catch (e) {
      throw new ConvertMp4ErrorException(e);
    }
  }

  public async getDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => Ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      return resolve(parseInt(metadata.format.duration, 10));
    }));
  }

  public async createThumbs(filePath: string, options: {
    toFolder: string;
    count?: number;
    size?: string;
  }): Promise<string[]> {
    let thumbs = [];
    return new Promise((resolve, reject) => new Ffmpeg(filePath)
      .on('filenames', (filenames) => {
        thumbs = filenames;
      })
      .on('end', () => resolve(thumbs))
      .on('error', reject)
      .screenshot({
        folder: options.toFolder,
        filename: `${StringHelper.randomString(5)}-%s.png`,
        count: options.count || 3,
        size: options.size || '320x240'
      }));
  }
}
