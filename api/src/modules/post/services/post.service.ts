import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  StringHelper,
  EntityNotFoundException,
  QueueEventService,
  QueueEvent
} from 'src/kernel';
import { UserDto } from 'src/modules/user/dtos';
import { isObjectId } from 'src/kernel/helpers/string.helper';
import { FileService } from 'src/modules/file/services';
import { FileResponseDto, FileDto } from 'src/modules/file';
import { PostDto } from '../dtos';
import { PostCreatePayload } from '../payloads/post-create.payload';
import { PostModel, PostMetaModel } from '../models';
import { POST_MODEL_PROVIDER, POST_META_MODEL_PROVIDER } from '../providers';
import { POST_CATEGORY_CHANNEL, CATEGORY_EVENTS } from '../constants';

@Injectable()
export class PostService {
  constructor(
    @Inject(POST_MODEL_PROVIDER)
    private readonly postModel: Model<PostModel>,
    @Inject(POST_META_MODEL_PROVIDER)
    private readonly postMetaModel: Model<PostMetaModel>,
    private readonly fileService: FileService,

    private readonly queueEventService: QueueEventService
  ) {
    this.queueEventService.subscribe(
      POST_CATEGORY_CHANNEL,
      'HANDLE_POST_CATEGORY',
      this.categoryChangeUpdater.bind(this)
    );
  }

  public async find(params: any): Promise<PostModel[]> {
    return this.postModel.find(params);
  }

  public async findByIdOrSlug(id: string | ObjectId): Promise<PostModel> {
    const query =
      id instanceof ObjectId || StringHelper.isObjectId(id)
        ? { _id: id }
        : { slug: id };
    return this.postModel.findOne(query);
  }

  public async generateSlug(title: string, id?: string | ObjectId) {
    // consider if need unique slug with post type
    const slug = StringHelper.createAlias(title);
    const query = { slug } as any;
    if (id) {
      query._id = { $ne: id };
    }
    const count = await this.postModel.countDocuments(query);
    if (!count) {
      return slug;
    }

    return this.generateSlug(`${slug}1`, id);
  }

  public async create(
    payload: PostCreatePayload,
    user?: UserDto
  ): Promise<PostModel> {
    const data = {
      ...payload,
      updatedAt: new Date(),
      createdAt: new Date()
    };
    if (user && !data.authorId) {
      data.authorId = user._id;
    }
    data.slug = await this.generateSlug(payload.slug || payload.title);

    const post = await this.postModel.create(data);
    if (payload.meta && Array.isArray(payload.meta)) {
      await Promise.all(
        payload.meta.map(meta =>
          this.postMetaModel.create({
            ...meta,
            postId: post._id
          })
        )
      );
    }

    return post;
  }

  public async update(
    id: string | ObjectId,
    payload: PostCreatePayload,
    user?: UserDto
  ): Promise<PostModel> {
    const post = await this.findByIdOrSlug(id);
    if (!post) {
      throw new NotFoundException();
    }
    // TODO - check logical here
    post.content = payload.content;
    post.shortDescription = payload.shortDescription;
    payload.slug &&
      post.set('slug', await this.generateSlug(payload.slug, post._id));
    payload.status && post.set('status', payload.status);
    payload.image && post.set('image', payload.image);
    user && post.set('updatedBy', user._id);
    post.set('updatedAt', new Date());
    await post.save();

    // Update meta data if have
    if (payload.meta && Array.isArray(payload.meta)) {
      Promise.all(
        payload.meta.map(metaData =>
          this.postModel.update(
            {
              postId: post._id,
              key: metaData.key
            },
            {
              postId: post._id,
              key: metaData.key,
              value: metaData.value
            },
            {
              upsert: true
            }
          )
        )
      );
    }

    return post;
  }

  public async delete(id: string | ObjectId): Promise<boolean> {
    const post = await this.findByIdOrSlug(id);
    if (!post) {
      throw new NotFoundException();
    }

    await post.remove();
    await this.postMetaModel.remove({ postId: post._id });

    return true;
  }

  public async adminGetDetails(id: string): Promise<PostDto> {
    const [post, meta] = await Promise.all([
      this.postModel.findById(id),
      this.postMetaModel.find({ postId: id })
    ]);
    // TODO - populate data hook?
    if (!post) {
      throw new EntityNotFoundException();
    }
    const dto = new PostDto(post);
    dto.meta = meta;
    return dto;
  }

  public async getPublic(id: string): Promise<PostDto> {
    const post = await this.findByIdOrSlug(id);
    // TODO - map details from meta data
    if (!post) {
      throw new EntityNotFoundException();
    }

    let image = post.image as any;
    if (isObjectId(post.image)) {
      const file = await this.fileService.findById(post.image);
      if (file) {
        image = FileResponseDto.fromFile(new FileDto(file));
      }
    }

    // author name, category info, etc...

    const dto = new PostDto(post);
    dto.image = image;
    return dto;
  }

  private async categoryChangeUpdater(event: QueueEvent) {
    try {
      if (event.eventName !== CATEGORY_EVENTS.DELETED) {
        return;
      }

      // TODO - check if need to convert string to ObjectId
      const categoryId = event.data._id;
      await this.postModel.updateMany(
        {
          categoryIds: categoryId
        },
        {
          $pull: {
            categoryIds: categoryId,
            categorySearchIds: categoryId
          }
        }
      );
    } catch (e) {
      // TODO - log me
    }
  }
}
