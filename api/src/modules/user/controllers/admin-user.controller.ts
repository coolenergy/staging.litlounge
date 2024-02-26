import {
  HttpCode,
  HttpStatus,
  Controller,
  Get,
  Injectable,
  UseGuards,
  Body,
  Put,
  Query,
  ValidationPipe,
  UsePipes,
  Param,
  Post,
  Res
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { PageableData } from 'src/kernel/common';
import { DataResponse } from 'src/kernel';
import { AuthService } from 'src/modules/auth/services';
import { Parser } from 'json2csv';
import {
  UserSearchRequestPayload,
  UserAuthCreatePayload,
  UserAuthUpdatePayload
} from '../payloads';

import { UserDto, IUserResponse } from '../dtos';
import { UserService, UserSearchService } from '../services';

@Injectable()
@Controller('admin/users')
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
    private readonly userSearchService: UserSearchService,
    private readonly authService: AuthService
  ) {}

  @Get('/search')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(
    @Query() req: UserSearchRequestPayload
  ): Promise<DataResponse<PageableData<IUserResponse>>> {
    return DataResponse.ok(await this.userSearchService.search(req));
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async createUser(
    @Body() payload: UserAuthCreatePayload
  ): Promise<DataResponse<IUserResponse>> {
    const user = await this.userService.create(payload, {
      roles: payload.roles,
      emailVerified: payload.emailVerified,
      status: payload.status
    });

    if (payload.password) {
      // generate auth if have pw, otherwise will create random and send to user email?
      await Promise.all([
        this.authService.create({
          type: 'email',
          value: payload.password,
          source: 'user',
          key: payload.email,
          sourceId: user._id
        }),
        this.authService.create({
          type: 'username',
          value: payload.password,
          source: 'user',
          key: payload.username,
          sourceId: user._id
        })
      ]);
    }

    return DataResponse.ok(new UserDto(user).toResponse(true));
  }

  @Put('/')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async updateMe(
    @Body() payload: UserAuthUpdatePayload,
    @CurrentUser() currentUser: UserDto
  ): Promise<DataResponse<IUserResponse>> {
    await this.userService.adminUpdate(currentUser._id, payload);

    const user = await this.userService.findById(currentUser._id);
    return DataResponse.ok(new UserDto(user).toResponse(true));
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async updateUser(
    @Body() payload: UserAuthUpdatePayload,
    @Param('id') id: string
  ): Promise<DataResponse<IUserResponse>> {
    await this.userService.adminUpdate(id, payload);

    const user = await this.userService.findById(id);
    return DataResponse.ok(new UserDto(user).toResponse(true));
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async getDetails(
    @Param('id') id: string
  ): Promise<DataResponse<IUserResponse>> {
    const user = await this.userService.findById(id);
    // TODO - check roles or other to response info
    return DataResponse.ok(new UserDto(user).toResponse(true));
  }

  @Get('/export/csv')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async exportCsv(
    @Query() query: UserSearchRequestPayload,
    @Query('fileName') nameFile: string,
    @Res() res: any
  ): Promise<any> {
    const fileName = nameFile || 'users_export.csv';
    const fields = [
      {
        label: 'username',
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
    const { data } = await this.userSearchService.search({
      ...query,
      limit: 9999
    });
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
    const results = await this.userService.stats();
    return DataResponse.ok(results);
  }
}
