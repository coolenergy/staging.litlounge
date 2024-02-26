import {
  Controller,
  Injectable,
  UseGuards,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Put,
  Get,
  Param,
  Query,
  Request,
  UseInterceptors,
  Res,
  HttpException
} from '@nestjs/common';
import { Response, Request as Req } from 'express';
import {
  DataResponse,
  PageableData,
  getConfig,
  EntityNotFoundException,
  QueueEventService,
  QueueEvent
} from 'src/kernel';
import { AuthService } from 'src/modules/auth/services';
import { Roles, CurrentUser } from 'src/modules/auth/decorators';
import { UserInterceptor } from 'src/modules/auth/interceptors';
import { RoleGuard, AuthGuard } from 'src/modules/auth/guards';
import { FileUploadInterceptor, FileUploaded, FileDto } from 'src/modules/file';
import { UserDto } from 'src/modules/user/dtos';
import { FavouriteService } from 'src/modules/favourite/services';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { CountryService } from 'src/modules/utils/services';
import {
  DELETE_FILE_TYPE,
  FileService,
  FILE_EVENT,
  MEDIA_FILE_CHANNEL
} from 'src/modules/file/services';
import { omit } from 'lodash';
import { EXCLUDE_FIELDS } from 'src/kernel/constants';
import { AccountNotFoundxception } from 'src/modules/user/exceptions';
import { PasswordIncorrectException } from 'src/modules/auth/exceptions';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PerformerBroadcastSetting } from '../payloads/performer-broadcast-setting.payload';
import { PERFORMER_STATUSES } from '../constants';
import { PerformerDto, IPerformerResponse, BlockSettingDto } from '../dtos';
import {
  PerformerUpdatePayload,
  PerformerSearchPayload,
  PerformerStreamingStatusUpdatePayload,
  BlockSettingPayload,
  DefaultPricePayload
} from '../payloads';
import { PerformerService, PerformerSearchService } from '../services';

@Injectable()
@Controller('performers')
@ApiTags('Performer')
export class PerformerController {
  constructor(
    private readonly authService: AuthService,
    private readonly performerService: PerformerService,
    private readonly performerSearchService: PerformerSearchService,
    private readonly favoriteService: FavouriteService,
    private readonly settingService: SettingService,
    private readonly countryService: CountryService,
    private readonly fileService: FileService,
    private readonly queueEventService: QueueEventService
  ) {}

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  // @Roles('performer')
  // @UseGuards(RoleGuard)
  async me(@Request() request: Req): Promise<DataResponse<IPerformerResponse>> {
    const jwtToken = request.headers.authorization;
    const performer = await this.authService.getSourceFromJWT(jwtToken);
    if (!performer || performer.status !== PERFORMER_STATUSES.ACTIVE) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const result = await this.performerService.getDetails(
      performer._id,
      jwtToken
    );
    return DataResponse.ok(new PerformerDto(result).toResponse(true));
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(UserInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async usearch(
    @Query() req: PerformerSearchPayload,
    @CurrentUser() user: UserDto,
    @Request() request: Req
  ): Promise<DataResponse<PageableData<IPerformerResponse>>> {
    const query = { ...req };
    // only query activated performer, sort by online time
    query.status = PERFORMER_STATUSES.ACTIVE;
    let ipClient =
      request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    ipClient = Array.isArray(ipClient) ? ipClient.toString() : ipClient;
    if (ipClient.substr(0, 7) === '::ffff:') {
      ipClient = ipClient.substr(7);
    }
    // const ipClient = '115.75.211.252';
    const whiteListIps = ['127.0.0.1', '0.0.0.1'];
    let userCountry = null;
    let countryCode = null;
    if (whiteListIps.indexOf(ipClient) === -1) {
      userCountry = await this.countryService.findCountryByIP(ipClient);
      if (
        userCountry &&
        userCountry.status === 'success' &&
        userCountry.countryCode
      ) {
        countryCode = userCountry.countryCode;
      }
    }
    const data = await this.performerSearchService.advancedSearch(
      query,
      user,
      countryCode
    );
    return DataResponse.ok({
      total: data.total,
      data: data.data
    });
  }

  @Put('/')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @ApiSecurity('authorization')
  @ApiOperation({ summary: 'Update Performer'})
  async updatePerformer(
    @CurrentUser() currentPerformer: PerformerDto,
    @Body() payload: PerformerUpdatePayload,
    @Request() request: Req
  ): Promise<DataResponse<IPerformerResponse>> {
    await this.performerService.update(
      currentPerformer._id,
      omit(payload, EXCLUDE_FIELDS)
    );

    const performer = await this.performerService.getDetails(
      currentPerformer._id,
      request.headers.authorization
    );
    return DataResponse.ok(new PerformerDto(performer).toResponse(true));
  }

  @Get('/:username/view')
  @UseInterceptors(UserInterceptor)
  @HttpCode(HttpStatus.OK)
  async getDetails(
    @Param('username') performerUsername: string,
    @Request() req: Req,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<Partial<PerformerDto>>> {
    let ipClient =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ipClient = Array.isArray(ipClient) ? ipClient.toString() : ipClient;
    if (ipClient.substr(0, 7) === '::ffff:') {
      ipClient = ipClient.substr(7);
    }
    // const ipClient = '115.75.211.252';
    const whiteListIps = ['127.0.0.1', '0.0.0.1'];
    let userCountry = null;
    let countryCode = null;
    if (whiteListIps.indexOf(ipClient) === -1) {
      userCountry = await this.countryService.findCountryByIP(ipClient);
      if (
        userCountry &&
        userCountry.status === 'success' &&
        userCountry.countryCode
      ) {
        countryCode = userCountry.countryCode;
      }
    }
    const performer = await this.performerService.findByUsername(
      performerUsername,
      countryCode,
      user
    );
    if (!performer || performer.status !== PERFORMER_STATUSES.ACTIVE) {
      throw new EntityNotFoundException();
    }

    if (user) {
      const favorite = await this.favoriteService.findOne({
        favoriteId: performer._id,
        ownerId: user._id
      });
      if (favorite) performer.isFavorite = true;
    }

    const [defaultGroupChatPrice, defaultC2CPrice] = await Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.GROUP_CHAT_DEFAULT_PRICE) || 0,
      this.settingService.getKeyValue(SETTING_KEYS.PRIVATE_C2C_PRICE) || 0
    ]);
    performer.privateCallPrice = typeof performer.privateCallPrice !== 'undefined' ? performer.privateCallPrice : defaultC2CPrice;
    performer.groupCallPrice = typeof performer.groupCallPrice !== 'undefined' ? performer.groupCallPrice : defaultGroupChatPrice;

    return DataResponse.ok(performer.toPublicDetailsResponse());
  }

  @Post('/documents/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('performer-document', 'file', {
      destination: getConfig('file').documentDir
    })
  )
  async uploadPerformerDocument(
    @FileUploaded() file: FileDto,
    @CurrentUser() performer: PerformerDto,
    @Request() request: Req
  ): Promise<any> {
    return DataResponse.ok({
      ...file,
      url: `${file.getUrl()}?documentId=${file._id}&token=${
        request.headers.authorization
      }`
    });
  }

  @Post('/release-form/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('performer-release-form', 'file', {
      destination: getConfig('file').documentDir
    })
  )
  async uploadPerformerReleaseForm(
    @FileUploaded() file: FileDto,
    @CurrentUser() performer: PerformerDto,
    @Request() request: Req
  ): Promise<any> {
    return DataResponse.ok({
      ...file,
      url: `${file.getUrl()}?documentId=${file._id}&token=${
        request.headers.authorization
      }`
    });
  }

  @Post('/:id/inc-view')
  @HttpCode(HttpStatus.OK)
  async increaseView(
    @Param('id') performerId: string
  ): Promise<DataResponse<any>> {
    await this.performerService.viewProfile(performerId);
    // TODO - check roles or other to response info
    return DataResponse.ok({
      success: true
    });
  }

  @Post('/avatar/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('avatar', 'avatar', {
      destination: getConfig('file').avatarDir,
      generateThumbnail: true,
      replaceWithThumbail: true,
      thumbnailSize: getConfig('image').avatar
    })
  )
  async uploadPerformerAvatar(
    @FileUploaded() file: FileDto,
    @CurrentUser() performer: PerformerDto
  ): Promise<any> {
    await this.performerService.updateAvatar(performer._id, file);
    await this.fileService.addRef(file._id, {
      itemId: performer._id,
      itemType: 'performer-avatar'
    });
    await this.queueEventService.publish(
      new QueueEvent({
        channel: MEDIA_FILE_CHANNEL,
        eventName: FILE_EVENT.FILE_RELATED_MODULE_UPDATED,
        data: {
          type: DELETE_FILE_TYPE.FILEID,
          currentFile: performer.avatarId,
          newFile: file._id
        }
      })
    );
    return DataResponse.ok({
      ...file,
      url: file.getUrl()
    });
  }

  @Post('/header/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('header', 'header', {
      destination: getConfig('file').headerDir,
      generateThumbnail: true,
      replaceWithThumbail: true,
      thumbnailSize: getConfig('image').header
    })
  )
  async uploadPerformerHeader(
    @FileUploaded() file: FileDto,
    @CurrentUser() performer: PerformerDto
  ): Promise<any> {
    await this.performerService.updateHeader(performer._id, file);
    await this.fileService.addRef(file._id, {
      itemId: performer._id,
      itemType: 'performer-header'
    });
    await this.queueEventService.publish(
      new QueueEvent({
        channel: MEDIA_FILE_CHANNEL,
        eventName: FILE_EVENT.FILE_RELATED_MODULE_UPDATED,
        data: {
          type: DELETE_FILE_TYPE.FILEID,
          currentFile: performer.headerId,
          newFile: file._id
        }
      })
    );
    return DataResponse.ok({
      ...file,
      url: file.getUrl()
    });
  }

  @Post('/blocking/update')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  async updateBlockSetting(
    @Body() payload: BlockSettingPayload,
    @CurrentUser() performer: PerformerDto
  ) {
    const data = await this.performerService.updateBlockSetting(
      performer._id,
      payload
    );
    return DataResponse.ok(data);
  }

  @Get('/blocking')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  async getBlockSetting(
    @CurrentUser() performer: PerformerDto
  ): Promise<DataResponse<BlockSettingDto>> {
    const data = await this.performerService.getBlockSetting(performer._id);
    return DataResponse.ok(new BlockSettingDto(data));
  }

  @Get('/:performerId/check-blocking')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async checkBlock(
    @Param('performerId') performerId: string,
    @Request() req: Req,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    let ipClient =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ipClient = Array.isArray(ipClient) ? ipClient.toString() : ipClient;
    if (ipClient.substr(0, 7) === '::ffff:') {
      ipClient = ipClient.substr(7);
    }
    // const ipClient = '115.75.211.252';
    const whiteListIps = ['127.0.0.1', '0.0.0.1'];
    let userCountry = null;
    let countryCode = null;
    if (whiteListIps.indexOf(ipClient) === -1) {
      userCountry = await this.countryService.findCountryByIP(ipClient);
      if (
        userCountry &&
        userCountry.status === 'success' &&
        userCountry.countryCode
      ) {
        countryCode = userCountry.countryCode;
      }
    }
    const block = await this.performerService.checkBlock(
      performerId,
      countryCode,
      user
    );

    return DataResponse.ok(block);
  }

  @Post('/streaming-status/update')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStreamingStatus(
    @CurrentUser() currentPerformer: PerformerDto,
    @Body() payload: PerformerStreamingStatusUpdatePayload
  ): Promise<DataResponse<IPerformerResponse>> {
    await this.performerService.updateSteamingStatus(
      currentPerformer._id,
      payload.status || ''
    );

    const performer = await this.performerService.findById(
      currentPerformer._id
    );
    return DataResponse.ok(new PerformerDto(performer).toResponse(true));
  }

  @Post('/default-price/update')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateDefaultPrice(
    @CurrentUser() currentPerformer: PerformerDto,
    @Body() payload: DefaultPricePayload
  ): Promise<DataResponse<IPerformerResponse>> {
    await this.performerService.updateDefaultPrice(
      currentPerformer._id,
      payload
    );

    const performer = await this.performerService.findById(
      currentPerformer._id
    );
    return DataResponse.ok(new PerformerDto(performer).toResponse(true));
  }

  @Post('/broadcast-setting/update')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateBroadcastSetting(
    @CurrentUser() currentPerformer: PerformerDto,
    @Body() payload: PerformerBroadcastSetting
  ): Promise<DataResponse<IPerformerResponse>> {
    await this.performerService.updateBroadcastSetting(
      currentPerformer._id,
      payload
    );

    const performer = await this.performerService.findById(
      currentPerformer._id
    );
    return DataResponse.ok(new PerformerDto(performer).toResponse(true));
  }

  @Post('/suspend-account')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async suspendAccount(
    @CurrentUser() currentPerformer: PerformerDto,
    @Body('password') password: string
  ): Promise<DataResponse<any>> {
    const auth = await this.authService.findBySource({
      source: 'performer',
      sourceId: currentPerformer._id
    });
    if (!auth) {
      throw new AccountNotFoundxception();
    }
    if (!this.authService.verifyPassword(password, auth)) {
      throw new PasswordIncorrectException();
    }

    await this.performerService.selfSuspendAccount(
      currentPerformer._id
    );
    return DataResponse.ok({success: true});
  }

  @Get('/documents/auth/check')
  @HttpCode(HttpStatus.OK)
  async checkAuth(
    @Request() request: Req,
    @Res() response: Response
  ): Promise<Response> {
    if (!request.query.token) {
      return response.status(HttpStatus.UNAUTHORIZED).send();
    }
    const user = await this.authService.getSourceFromJWT(
      request.query.token as string
    );
    if (!user) {
      return response.status(HttpStatus.UNAUTHORIZED).send();
    }
    const valid = await this.performerService.checkAuthDocument(request, user);
    return response
      .status(valid ? HttpStatus.OK : HttpStatus.UNAUTHORIZED)
      .send();
  }

  @Get('/rand')
  @HttpCode(HttpStatus.OK)
  async getRandPerformer(
    @Query('size') size: string
  ): Promise<DataResponse<PageableData<any>>> {
    const resp = await this.performerSearchService.randomSelect(
      parseInt(size, 10) || 10
    );
    return DataResponse.ok(resp);
  }
}
