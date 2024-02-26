import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Param,
  Get,
  Post,
  UseGuards,
  Body,
  Query
} from '@nestjs/common';
import { AuthGuard, RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { UserDto } from 'src/modules/user/dtos';
import { RefundRequestService } from '../services/refund-request.service';
import { RefundRequestDto } from '../dtos/refund-request.dto';
import {
  RefundRequestCreatePayload, RefundRequestSearchPayload,
  RefundRequestUpdatePayload
} from '../payloads/refund-request.payload';

@Injectable()
@Controller('refund-requests')
export class RefundRequestController {
  constructor(
    private readonly refundRequestService: RefundRequestService
  ) { }

  @Get('/search')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminSearch(
    @Query() req: RefundRequestSearchPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<PageableData<RefundRequestDto>>> {
    const data = await this.refundRequestService.search(req, user);
    return DataResponse.ok(data);
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() payload: RefundRequestCreatePayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.refundRequestService.create(payload, user);
    return DataResponse.ok(data);
  }

  @Post('/status/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id') id: string,
    @Body() payload: RefundRequestUpdatePayload
  ): Promise<DataResponse<any>> {
    const data = await this.refundRequestService.updateStatus(id, payload);
    return DataResponse.ok(data);
  }
}
