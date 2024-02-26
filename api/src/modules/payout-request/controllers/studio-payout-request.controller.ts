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
  Put,
  Query
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { StudioDto } from 'src/modules/studio/dtos';
import { PerformerService } from 'src/modules/performer/services';
import { UserDto } from 'src/modules/user/dtos';
import {
  PayoutRequestCreatePayload,
  PayoutRequestSearchPayload,
  PayoutRequestUpdatePayload
} from '../payloads/payout-request.payload';
import { PayoutRequestService, StudioPayoutRequestService } from '../services';
import { PayoutRequestDto } from '../dtos/payout-request.dto';

@Injectable()
@Controller('payout-requests/studio')
export class StudioPayoutRequestController {
  constructor(
    private readonly payoutRequestService: StudioPayoutRequestService,
    private readonly memberPayoutRequestService: PayoutRequestService,
    private readonly performerService: PerformerService
  ) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @Roles('studio')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() payload: PayoutRequestCreatePayload,
    @CurrentUser() user: StudioDto
  ): Promise<DataResponse<any>> {
    const data = await this.payoutRequestService.create(payload, user);
    return DataResponse.ok(data);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('studio')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() payload: PayoutRequestCreatePayload,
    @CurrentUser() studio: StudioDto
  ): Promise<DataResponse<any>> {
    const data = await this.payoutRequestService.update(id, payload, studio);
    return DataResponse.ok(data);
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @Roles('studio')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details(
    @Param('id') id: string,
    @CurrentUser() user: StudioDto
  ): Promise<DataResponse<any>> {
    const data = await this.payoutRequestService.details(id, user);
    return DataResponse.ok(data);
  }

  @Get('/admin/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminDetails(@Param('id') id: string): Promise<DataResponse<any>> {
    const data = await this.payoutRequestService.adminDetails(id);
    return DataResponse.ok(data);
  }

  @Get('/performer-request')
  @Roles('studio')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async perfomrerRequest(
    @Query() payload: PayoutRequestSearchPayload,
    @CurrentUser() studio: StudioDto
  ) {
    const results = await this.payoutRequestService.performerRequest(
      payload,
      studio
    );
    return DataResponse.ok(results);
  }

  @Put('/update/:id')
  @Roles('studio')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateMemberRequest(
    @Param('id') id: string,
    @Body() payload: PayoutRequestUpdatePayload,
    @CurrentUser() studio: UserDto
  ) {
    const request = await this.memberPayoutRequestService.updateStatus(
      id,
      payload,
      studio
    );
    return DataResponse.ok(new PayoutRequestDto(request));
  }
}
