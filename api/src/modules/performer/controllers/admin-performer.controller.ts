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
  UseInterceptors,
  Res,
  Request
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, PageableData, getConfig } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { AuthService } from 'src/modules/auth/services';
import { UserDto } from 'src/modules/user/dtos';
import { FileUploadInterceptor, FileUploaded, FileDto } from 'src/modules/file';
import { Parser } from 'json2csv';
import { ConversationService } from 'src/modules/message/services';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { PerformerDto, IPerformerResponse } from '../dtos';
import {
  PerformerCreatePayload,
  AdminUpdatePayload,
  PerformerSearchPayload
} from '../payloads';
import { PerformerService, PerformerSearchService } from '../services';
// import { ConversationDto } from 'src/modules/message/dtos';

@Injectable()
@Controller('admin/performers')
export class AdminPerformerController {
  constructor(
    private readonly performerService: PerformerService,
    private readonly performerSearchService: PerformerSearchService,
    private readonly conversationService: ConversationService,
    private readonly socketUserService: SocketUserService,
    private readonly authService: AuthService
  ) {}

  @Get('/search')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(
    @Query() req: PerformerSearchPayload,
    @CurrentUser() currentUser: UserDto
  ): Promise<DataResponse<PageableData<IPerformerResponse>>> {
    const results = await this.performerSearchService.search(req, currentUser);
    return DataResponse.ok(results);
  }

  @Get('/online')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchOnline(
    @Query() req: PerformerSearchPayload,
    @CurrentUser() currentUser: UserDto
  ): Promise<DataResponse<PageableData<IPerformerResponse>>> {
    req.isOnline = true;
    const results = await this.performerSearchService.search(req, currentUser);
    const performerIds = results.data.map(p => p._id);
    const conversations = await Promise.all(
      performerIds.map(id =>
        this.conversationService.findPerformerPublicConversation(id)
      )
    );
    const watchings = await Promise.all(
      performerIds.map((id, index) =>
        conversations[index] ? this.socketUserService.countRoomUserConnections(id.toString()) : 0
      )
    );

    return DataResponse.ok({...results, data: results.data.map((p, index) => ({...p, watching: watchings[index]})) });
  }

  @Post()
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @CurrentUser() currentUser: UserDto,
    @Body() payload: PerformerCreatePayload
  ): Promise<DataResponse<PerformerDto>> {
    // password should be created in auth module only
    const { password } = payload;
    // eslint-disable-next-line no-param-reassign
    delete payload.password;
    const performer = await this.performerService.create(payload, currentUser);

    if (password) {
      await Promise.all([
        this.authService.create({
          source: 'performer',
          sourceId: performer._id,
          type: 'email',
          key: performer.email.toLowerCase().trim(),
          value: password
        }),
        this.authService.create({
          source: 'performer',
          sourceId: performer._id,
          type: 'username',
          key: performer.username.trim(),
          value: password
        })
      ]);
    }

    return DataResponse.ok(performer);
  }

  @Put('/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  async updateUser(
    @Body() payload: AdminUpdatePayload,
    @Param('id') performerId: string,
    @Request() req: any
  ): Promise<DataResponse<PerformerDto>> {
    const oldPerformer = await this.performerService.getDetails(performerId, req.jwToken);
    await this.performerService.adminUpdate(performerId, payload);

    const performer = await this.performerService.getDetails(performerId, req.jwToken);
    if (payload.username && oldPerformer.username && oldPerformer.username.toLowerCase() !== payload.username.toLowerCase()) {
      await this.authService.changeNewKey(performer._id, 'username', payload.username.toLowerCase());
    }
    if (payload.email && oldPerformer.email && oldPerformer.email.toLowerCase() !== payload.email.toLowerCase()) {
      await this.authService.changeNewKey(performer._id, 'email', payload.email.toLowerCase());
    }
    return DataResponse.ok(performer);
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async getDetails(
    @Param('id') performerId: string,
    @Request() req: any
  ): Promise<DataResponse<IPerformerResponse>> {
    const performer = await this.performerService.getDetails(performerId, req.jwToken);
    // TODO - check roles or other to response info
    return DataResponse.ok(new PerformerDto(performer).toResponse(true));
  }

  @Post('/documents/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('performer-document', 'file', {
      destination: getConfig('file').documentDir
    })
  )
  async uploadPerformerDocument(
    @Param('id') userId: string,
    @FileUploaded() file: FileDto
  ): Promise<any> {
    return DataResponse.ok({
      ...file,
      url: file.getUrl()
    });
  }

  @Post('/avatar/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('avatar', 'avatar', {
      destination: getConfig('file').avatarDir,
      generateThumbnail: true,
      replaceWithThumbail: true,
      thumbnailSize: getConfig('image').avatar
    })
  )
  async uploadPerformerAvatar(@FileUploaded() file: FileDto): Promise<any> {
    // TODO - define url for perfomer id if have?
    return DataResponse.ok({
      ...file,
      url: file.getUrl()
    });
  }

  @Post('/header/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('header', 'header', {
      destination: getConfig('file').headerDir,
      generateThumbnail: true,
      replaceWithThumbail: true,
      thumbnailSize: getConfig('image').header
    })
  )
  async uploadPerformerHeader(@FileUploaded() file: FileDto): Promise<any> {
    // TODO - define url for perfomer id if have?
    return DataResponse.ok({
      ...file,
      url: file.getUrl()
    });
  }

  @Get('/export/csv')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async exportCsv(
    @Query() query: PerformerSearchPayload,
    @Query('fileName') nameFile: string,
    @Res() res: any,
    @CurrentUser() user: UserDto
  ): Promise<any> {
    const fileName = nameFile || 'performers_export.csv';
    const fields = [
      {
        label: 'Name',
        value: 'name'
      },
      {
        label: 'Username',
        value: 'username'
      },
      {
        label: 'Email',
        value: 'email'
      },
      {
        label: 'Phone',
        value: 'phone'
      },
      {
        label: 'Status',
        value: 'status'
      },
      {
        label: 'Gender',
        value: 'gender'
      },
      {
        label: 'Country',
        value: 'country'
      },
      {
        label: 'Balance',
        value: 'balance'
      }
    ];
    const { data } = await this.performerSearchService.search({
      ...query,
      limit: 9999
    }, user);
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(fileName);
    return res.send(csv);
  }

  @Get('/stats')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async stats() {
    const results = await this.performerService.stats();
    return DataResponse.ok(results);
  }
}
