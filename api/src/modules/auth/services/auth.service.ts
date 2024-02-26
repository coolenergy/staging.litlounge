/* eslint-disable dot-notation */
/* eslint-disable no-shadow */
import { Injectable, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserDto } from 'src/modules/user/dtos';
import { PerformerDto } from 'src/modules/performer/dtos';
import { UserService } from 'src/modules/user/services';
import { PerformerService } from 'src/modules/performer/services';
import { StringHelper, EntityNotFoundException } from 'src/kernel';
import { MailerService } from 'src/modules/mailer';
import { ConfigService } from 'nestjs-config';
import { StudioService } from 'src/modules/studio/services';
import { StudioDto } from 'src/modules/studio/dtos';
import { AuthCreateDto, AuthUpdateDto } from '../dtos';
import { AuthErrorException } from '../exceptions';
import {
  AUTH_MODEL_PROVIDER,
  FORGOT_MODEL_PROVIDER
} from '../providers/auth.provider';
import { AuthModel, ForgotModel } from '../models';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_MODEL_PROVIDER)
    private readonly AuthModel: Model<AuthModel>,
    @Inject(FORGOT_MODEL_PROVIDER)
    private readonly ForgotModel: Model<ForgotModel>,
    private readonly userService: UserService,
    private readonly performerService: PerformerService,
    private readonly mailService: MailerService,
    private readonly config: ConfigService,
    private readonly studioService: StudioService
  ) {}

  /**
   * generate password salt
   * @param byteSize integer
   */
  public generateSalt(byteSize = 16): string {
    return crypto.randomBytes(byteSize).toString('base64');
  }

  public encryptPassword(pw: string, salt: string): string {
    const defaultIterations = 10000;
    const defaultKeyLength = 64;

    return crypto
      .pbkdf2Sync(pw, salt, defaultIterations, defaultKeyLength, 'sha1')
      .toString('base64');
  }

  public async create(data: AuthCreateDto): Promise<AuthModel> {
    const salt = this.generateSalt();
    let newVal = data.value;
    if (['email', 'username'].includes(data.type) && newVal) {
      newVal = this.encryptPassword(newVal, salt);
    }

    // avoid admin update
    // TODO - should listen via user event?
    let auth = await this.AuthModel.findOne({
      type: data.type,
      source: data.source,
      sourceId: data.sourceId
    });
    if (!auth) {
      auth = new this.AuthModel({
        type: data.type,
        source: data.source,
        sourceId: data.sourceId
      });
    }

    auth.salt = salt;
    auth.value = newVal;
    auth.key = data.key.toLowerCase();

    return auth.save();
  }

  public async changeNewKey(sourceId, type, newKey) {
    const auth = await this.AuthModel.findOne({
      type,
      sourceId
    });
    if (!auth) return null;
    auth.key = newKey;
    return auth.save();
  }

  public async update(data: AuthUpdateDto) {
    const auths = await this.AuthModel.find({
      source: data.source,
      sourceId: data.sourceId
    });

    let user: any;
    switch (data.source) {
      case 'user':
        user = await this.userService.findById(data.sourceId);
        break;
      case 'studio':
        user = await this.studioService.findById(data.sourceId);
        break;
      case 'performer':
        user = await this.performerService.findById(data.sourceId);
        break;
      default:
        break;
    }
    if (!user) {
      throw new EntityNotFoundException();
    }

    const authEmail = auths.find(a => a.type === 'email');
    if (!authEmail && user.email) {
      await this.create({
        source: data.source,
        sourceId: data.sourceId,
        type: 'email',
        key: user.email.toLowerCase(),
        value: data.value
      });
    }

    const authUsername = auths.find(a => a.type === 'username');
    if (!authUsername && user.username) {
      await this.create({
        source: data.source,
        sourceId: data.sourceId,
        type: 'username',
        key: user.username.toLowerCase(),
        value: data.value
      });
    }

    await Promise.all(auths.map((auth) => {
      let newVal = data.value;
      const salt = this.generateSalt();
      newVal = this.encryptPassword(data.value, salt);
      auth.set('salt', salt);
      auth.set('value', newVal);
      return auth.save();
    }));

    return true;
  }

  public async findBySource(options: {
    source: string;
    sourceId?: ObjectId;
    type?: string;
    key?: string;
  }): Promise<AuthModel | null> {
    return this.AuthModel.findOne(options);
  }

  public verifyPassword(pw: string, auth: AuthModel): boolean {
    return this.encryptPassword(pw, auth.salt) === auth.value;
  }

  public generateJWT(auth: any, options: any = {}): string {
    const newOptions = {
      expiresIn: 60 * 60 * 24,
      ...options || {}
    };
    return jwt.sign(
      {
        authId: auth._id,
        source: auth.source,
        sourceId: auth.sourceId
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: newOptions.expiresIn
      }
    );
  }

  public verifyJWT(token: string) {
    try {
      return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (e) {
      return false;
    }
  }

  public decodeJWT(token: string) {
    try {
      const decoded = jwt.decode(token, {complete: true});
      return decoded.payload;
    } catch (e) {
      return false;
    }
  }

  public async getSourceFromJWT(jwt: string): Promise<any> {
    // TODO - check and move to user service?
    const decodded = this.verifyJWT(jwt);
    if (!decodded) {
      throw new AuthErrorException();
    }

    // TODO - detect source and get data?
    // TODO - should cache here?
    if (decodded['source'] === 'user') {
      const user = await this.userService.findById(decodded['sourceId']);

      // TODO - check activated status here
      return new UserDto(user);
    } if (decodded['source'] === 'performer') {
      const user = await this.performerService.findById(decodded['sourceId']);

      // TODO - check activated status here
      if (user) {
        user.isPerformer = true;
      }
      return new PerformerDto(user);
    } if (decodded['source'] === 'studio') {
      const studio = await this.studioService.findById(decodded['sourceId']);
      return new StudioDto(studio);
    }

    return null;
  }

  public async forgot(
    auth: AuthModel,
    source: {
      _id: ObjectId;
      email: string;
    }
  ) {
    const token = StringHelper.randomString(14);
    await this.ForgotModel.create({
      token,
      source: auth.source,
      sourceId: source._id,
      authId: auth._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const forgotLink = new URL(
      `auth/password-change?token=${token}`,
      this.config.get('app.baseUrl')
    ).href;

    await this.mailService.send({
      subject: 'Recover password',
      to: source.email,
      data: {
        forgotLink
      },
      template: 'forgot'
    });
    return true;
  }

  public async getForgot(token: string): Promise<ForgotModel> {
    return this.ForgotModel.findOne({ token });
  }
}
