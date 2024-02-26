import { Injectable, Inject, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { ConfigService } from 'nestjs-config';
import {
  StringHelper, EntityNotFoundException, QueueEventService, QueueEvent, getConfig
} from 'src/kernel';
import { writeFileSync, unlinkSync, existsSync, createReadStream } from 'fs';
import * as jwt from 'jsonwebtoken';
import { join } from 'path';
import { PhotoDto, ProductDto, VideoDto } from 'src/modules/performer-assets/dtos';
import { BannerDto } from 'src/modules/banner/dtos';
import { FILE_MODEL_PROVIDER } from '../providers';
import { FileModel } from '../models';
import { IMulterUploadedFile } from '../lib/multer/multer.utils';
import { FileDto } from '../dtos';
import { IFileUploadOptions } from '../lib';
import { ImageService } from './image.service';
import { VideoService } from './video.service';
import { NoFileException } from '../exceptions/no-file.exception';

const VIDEO_QUEUE_CHANNEL = 'VIDEO_PROCESS';
const PHOTO_QUEUE_CHANNEL = 'PHOTO_PROCESS';
export const MEDIA_FILE_CHANNEL = 'MEDIA_FILE_CHANNEL';
export const FILE_EVENT = {
  VIDEO_PROCSSED: 'VIDEO_PROCSSED',
  PHOTO_PROCESSED: 'PHOTO_PROCESSED',
  FILE_RELATED_MODULE_UPDATED: 'FILE_RELATED_MODULE_UPDATED',
  ASSETS_ITEM_DELETED: 'ASSETS_ITEM_DELETED'
};
export const DELETE_FILE_TYPE = {
  FILEID: 'FILEID',
  FILE_PATH: 'FILE_PATH'
}
@Injectable()
export class FileService {
  private readonly logger = new Logger('FileService');

  constructor(
    private readonly config: ConfigService,
    @Inject(FILE_MODEL_PROVIDER)
    private readonly fileModel: Model<FileModel>,
    private readonly imageService: ImageService,
    private readonly videoService: VideoService,
    private readonly queueEventService: QueueEventService
  ) {
    this.queueEventService.subscribe(VIDEO_QUEUE_CHANNEL, 'PROCESS_VIDEO', this._processVideo.bind(this));
    this.queueEventService.subscribe(PHOTO_QUEUE_CHANNEL, 'PROCESS_PHOTO', this._processPhoto.bind(this));
    this.queueEventService.subscribe(MEDIA_FILE_CHANNEL, 'DELETE_MEDIA_FILE_IF_UPDATED', this.deleteMediaFileIfUpdated.bind(this));
    this.queueEventService.subscribe(MEDIA_FILE_CHANNEL, 'DELETE_MEDIA_FILE_IF_ASSETS_DELETED', this.deleteMediaFileIfAssetsDeleted.bind(this))
  }

  public async findById(id: string | ObjectId): Promise<FileDto> {
    const model = await this.fileModel.findById(id);
    return model ? new FileDto(model) : null;
  }

  public async findByIds(ids: string[] | ObjectId[]): Promise<FileDto[]> {
    const items = await this.fileModel.find({
      _id: {
        $in: ids
      }
    });

    return items.map((i) => new FileDto(i));
  }

  public async createFromMulter(
    type: string,
    multerData: IMulterUploadedFile,
    fileUploadOptions?: IFileUploadOptions
  ): Promise<FileDto> {
    const options = { ...fileUploadOptions } || {};
    const publicDir = this.config.get('file.publicDir');

    // replace new photo without exif, ignore video
    if (options.replaceWithoutExif) {
      const buffer = await this.imageService.replaceWithoutExif(multerData.path);
      unlinkSync(multerData.path);
      writeFileSync(multerData.path, buffer);
    }

    // if replace with thumbnail such as avatar, cover image
    // convert the file immediately
    if (options.replaceWithThumbail && options.generateThumbnail && options.thumbnailSize) {
      const buffer = await this.imageService.createThumbnail(multerData.path, options.thumbnailSize);
      unlinkSync(multerData.path);
      writeFileSync(multerData.path, buffer);
    }

    const data = {
      type,
      name: multerData.filename,
      description: '', // TODO - get from options
      mimeType: multerData.mimetype,
      server: options.server || 'local',
      // todo - get path from public
      path: multerData.path.replace(publicDir, ''),
      absolutePath: multerData.path,
      // TODO - update file size
      size: multerData.size,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: options.uploader ? options.uploader._id : null,
      updatedBy: options.uploader ? options.uploader._id : null
    };

    const file = await this.fileModel.create(data);
    // TODO - check option and process
    // eg create thumbnail, video converting, etc...
    return FileDto.fromModel(file);
  }

  public async addRef(
    fileId: string | ObjectId,
    ref: {
      itemId: ObjectId;
      itemType: string;
    }
  ) {
    return this.fileModel.updateOne(
      { _id: fileId },
      {
        $addToSet: {
          refItems: ref
        }
      }
    );
  }

  public async remove(fileId: string | ObjectId) {
    const file = await this.fileModel.findOne({ _id: fileId });
    if (!file) {
      throw new EntityNotFoundException();
    }

    const filePaths = [
      {
        absolutePath: file.absolutePath,
        path: file.path
      }
    ].concat(file.thumbnails || []);

    filePaths.forEach((fp) => {
      if (existsSync(fp.absolutePath)) {
        unlinkSync(fp.absolutePath);
      } else {
        const publicDir = this.config.get('file.publicDir');
        const filePublic = join(publicDir, fp.path);
        existsSync(filePublic) && unlinkSync(filePublic);
      }
    });
    // TODO - fire event
    return true;
  }

  public async removeIfNotHaveRef(fileId: string | ObjectId) {
    const file = await this.fileModel.findOne({ _id: fileId });
    if (!file) {
      throw new EntityNotFoundException();
    }

    if (file.refItems && !file.refItems.length) {
      return false;
    }

    if (existsSync(file.absolutePath)) {
      unlinkSync(file.absolutePath);
    } else {
      const publicDir = this.config.get('file.publicDir');
      const filePublic = join(publicDir, file.path);
      existsSync(filePublic) && unlinkSync(filePublic);
    }

    // TODO - fire event
    return true;
  }

  private async _processVideo(event: QueueEvent) {
    if (event.eventName !== 'processVideo') {
      return;
    }
    const fileData = event.data.file as FileDto;
    const options = event.data.options || {};
    try {
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'processing'
          }
        }
      );

      // get thumb of the file, then convert to mp4
      const publicDir = this.config.get('file.publicDir');
      const videoDir = this.config.get('file.videoDir');
      let videoPath: string;
      if (existsSync(fileData.absolutePath)) {
        videoPath = fileData.absolutePath;
      } else if (existsSync(join(publicDir, fileData.path))) {
        videoPath = join(publicDir, fileData.path);
      }

      if (!videoPath) {
        throw new NoFileException();
      }

      const respVideo = await this.videoService.convert2Mp4(videoPath);
      // delete old video and replace with new one
      const newAbsolutePath = respVideo.toPath;
      const newPath = respVideo.toPath.replace(publicDir, '');

      const respThumb = await this.videoService.createThumbs(videoPath, {
        toFolder: videoDir
      });
      const thumbnails = respThumb.map((name) => ({
        absolutePath: join(videoDir, name),
        path: join(videoDir, name).replace(publicDir, '')
      }));
      const duration = await this.videoService.getDuration(videoPath);
      existsSync(videoPath) && unlinkSync(videoPath);
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'finished',
            absolutePath: newAbsolutePath,
            path: newPath,
            thumbnails,
            duration
          }
        }
      );
    } catch (e) {
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'error'
          }
        }
      );

      throw e;
    } finally {
      // TODO - fire event to subscriber
      if (options.publishChannel) {
        await this.queueEventService.publish(
          new QueueEvent({
            channel: options.publishChannel,
            eventName: FILE_EVENT.VIDEO_PROCSSED,
            data: {
              meta: options.meta,
              fileId: fileData._id
            }
          })
        );
      }
    }
  }

  // TODO - fix here, currently we just support local server, need a better solution if scale?
  /**
   * generate mp4 video & thumbnail
   * @param fileId
   * @param options
   */
  public async queueProcessVideo(
    fileId: string | ObjectId,
    options?: {
      meta: Record<string, any>;
      publishChannel: string;
    }
  ) {
    // add queue and convert file to mp4 and generate thumbnail
    const file = await this.fileModel.findOne({ _id: fileId });
    if (!file || file.status === 'processing') {
      return false;
    }
    await this.queueEventService.publish(
      new QueueEvent({
        channel: VIDEO_QUEUE_CHANNEL,
        eventName: 'processVideo',
        data: {
          file: new FileDto(file),
          options
        }
      })
    );
    return true;
  }

  /**
   * process to create photo thumbnails
   * @param fileId file item
   * @param options
   */
  public async queueProcessPhoto(
    fileId: string | ObjectId,
    options?: {
      meta: Record<string, any>;
      publishChannel: string;
      thumbnailSize: {
        width: number;
        height: number;
      };
    }
  ) {
    // add queue and convert file to mp4 and generate thumbnail
    const file = await this.fileModel.findOne({ _id: fileId });
    if (!file || file.status === 'processing') {
      return false;
    }
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PHOTO_QUEUE_CHANNEL,
        eventName: 'processPhoto',
        data: {
          file: new FileDto(file),
          options
        }
      })
    );
    return true;
  }

  private async _processPhoto(event: QueueEvent) {
    if (event.eventName !== 'processPhoto') {
      return;
    }
    const fileData = event.data.file as FileDto;
    const options = event.data.options || {};
    try {
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'processing'
          }
        }
      );

      // get thumb of the file, then convert to mp4
      const publicDir = this.config.get('file.publicDir');
      const photoDir = this.config.get('file.photoDir');
      let photoPath: string;
      if (existsSync(fileData.absolutePath)) {
        photoPath = fileData.absolutePath;
      } else if (existsSync(join(publicDir, fileData.path))) {
        photoPath = join(publicDir, fileData.path);
      }

      if (!photoPath) {
        throw new NoFileException();
      }

      const meta = await this.imageService.getMetaData(photoPath);
      const buffer = await this.imageService.createThumbnail(
        photoPath,
        options.thumbnailSize || {
          width: 250,
          height: 250
        }
      );

      // store to a file
      const thumbName = `${StringHelper.randomString(5)}_thumb${StringHelper.getExt(photoPath)}`;
      writeFileSync(join(photoDir, thumbName), buffer);
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'finished',
            width: meta.width,
            height: meta.height,
            thumbnails: [
              {
                path: join(photoDir, thumbName).replace(publicDir, ''),
                absolutePath: join(photoDir, thumbName)
              }
            ]
          }
        }
      );
    } catch (e) {
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'error'
          }
        }
      );

      throw e;
    } finally {
      // TODO - fire event to subscriber
      if (options.publishChannel) {
        await this.queueEventService.publish(
          new QueueEvent({
            channel: options.publishChannel,
            eventName: FILE_EVENT.PHOTO_PROCESSED,
            data: {
              meta: options.meta,
              fileId: fileData._id
            }
          })
        );
      }
    }
  }

  /**
   * just generate key for
   */
  private generateJwt(fileId: string | ObjectId) {
    // 3h
    const expiresIn = 60 * 60 * 3;
    return jwt.sign(
      {
        fileId
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn
      }
    );
  }

  /**
   * generate download file url with expired time check
   * @param fileId
   * @param param1
   */
  public generateDownloadLink(fileId: string | ObjectId) {
    const newUrl = new URL(
      'files/download', getConfig('app').baseUrl
    );
    newUrl.searchParams.append('key', this.generateJwt(fileId));
    return newUrl.href;
  }

  public async getStreamToDownload(key: string) {
    try {
      const decoded = jwt.verify(key, process.env.TOKEN_SECRET) as any;
      const file = await this.fileModel.findById(decoded.fileId);
      if (!file) throw new EntityNotFoundException();
      let filePath;
      const publicDir = this.config.get('file.publicDir');
      if (existsSync(file.absolutePath)) {
        filePath = file.absolutePath;
      } else if (existsSync(join(publicDir, file.path))) {
        filePath = join(publicDir, file.path);
      } else {
        throw new EntityNotFoundException();
      }

      return {
        file,
        stream: createReadStream(filePath)
      };
    } catch (e) {
      throw new EntityNotFoundException();
    }
  }

  async deleteMediaFileIfUpdated(event: QueueEvent) {
    try {
      const { data, eventName } = event;
      if (eventName !== FILE_EVENT.FILE_RELATED_MODULE_UPDATED) {
        return;
      }

      const { type, currentFile, newFile } = data;
      if (`${currentFile}` === `${newFile}`) {
        return;
      }

      if (type === DELETE_FILE_TYPE.FILEID) {
        const file = await this.findById(currentFile);
        if(!file) {
          return;
        }

        this.remove(file._id);
      } else if (type === DELETE_FILE_TYPE.FILE_PATH) {
        if (existsSync(currentFile)) {
          unlinkSync(currentFile)
        } else {
          const publicDir = this.config.get('file.publicDir');
          const filePublic = join(publicDir, currentFile);
          existsSync(filePublic) && unlinkSync(filePublic);
        }
      }
    } catch(e) {
      this.logger.error(e);
    }
  }

  async deleteMediaFileIfAssetsDeleted(event: QueueEvent) {
    try {
      const { data, eventName } = event;
      if (eventName !== FILE_EVENT.ASSETS_ITEM_DELETED) {
        return;
      }

      const { type, metadata } = data;
      if (type === 'video') {
        const video = new VideoDto(metadata);
        const { fileId, thumbnailId, trailerId} = video;
        await Promise.all([
          fileId && this.remove(fileId),
          thumbnailId && this.remove(thumbnailId),
          trailerId && this.remove(trailerId)
        ]);
      } else if (type === 'gallery') {
        // const gallery = new GalleryDto(metadata);
        // const fileIds = [];
        // const photos = await this.photoService.find({galleryId: gallery._id});
        // photos.forEach(p => {
        //   fileIds.push(p.fileId);
        // });
        // await this.photoService.deleteMany({galleryId: gallery._id});
        // await Promise.all(fileIds.map(id => this.remove(id)));
      } else if (type === 'photo') {
        const photo = new PhotoDto(metadata);
        const { fileId } = photo;
        fileId && await this.remove(fileId);
      } else if (type === 'digital_product') {
        const product = new ProductDto(metadata);
        const { digitalFileId, imageId} = product;
        await Promise.all([
          digitalFileId && this.remove(digitalFileId),
          imageId && this.remove(imageId)
        ]);
      } else if (type === 'banner') {
        const { fileId } = new BannerDto(metadata);
        fileId && await this.remove(fileId);
      }
    } catch (e) {
      this.logger.error(e);
    }
  }
}
