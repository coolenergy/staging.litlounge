import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Get,
  UseGuards,
  Query,
  Param,
  Post,
  Body
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { StudioDto } from 'src/modules/studio/dtos';
import { PerformerDto } from 'src/modules/performer/dtos';
import { EarningService } from '../services/earning.service';
import {
  EarningSearchRequestPayload,
  UpdateEarningStatusPayload
} from '../payloads';
import {
  EarningDto,
  IEarning,
  IEarningStatResponse
} from '../dtos/earning.dto';
import { UserDto } from '../../user/dtos';

@Injectable()
@Controller('earning')
export class EarningController {
  constructor(private readonly earningService: EarningService) {}

  @Get('/admin/search')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminSearch(
    @Query() req: EarningSearchRequestPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<PageableData<IEarning>>> {
    const data = await this.earningService.search(req, user);
    return DataResponse.ok(data);
  }

  @Get('/performer/search')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(
    @Query() req: EarningSearchRequestPayload,
    @CurrentUser() performer: UserDto
  ): Promise<DataResponse<PageableData<IEarning>>> {
    req.targetId = performer._id.toString();
    const data = await this.earningService.search(req);
    return DataResponse.ok(data);
  }

  @Get('/studio/search')
  @Roles('studio')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async studioSearch(
    @Query() req: EarningSearchRequestPayload,
    @CurrentUser() studio: StudioDto
  ): Promise<DataResponse<PageableData<IEarning>>> {
    req.targetId = studio._id.toString();
    const data = await this.earningService.search(req);
    return DataResponse.ok(data);
  }

  @Get('/admin/stats')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminStats(
    @Query() req: EarningSearchRequestPayload
  ): Promise<DataResponse<IEarningStatResponse>> {
    const data = await this.earningService.adminStats(req);
    return DataResponse.ok(data);
  }

  @Get('/performer/stats')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async performerStats(
    @Query() req: EarningSearchRequestPayload,
    @CurrentUser() user: PerformerDto
  ): Promise<DataResponse<IEarningStatResponse>> {
    req.targetId = user._id.toString();
    const options = user.studioId ? {
      includingStudioEarning: true
    } : null;
    const data = await this.earningService.stats(req, options);
    return DataResponse.ok(data);
  }

  @Get('/studio/stats')
  @Roles('studio')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async studioStats(
    @Query() req: EarningSearchRequestPayload,
    @CurrentUser() studio: StudioDto
  ): Promise<DataResponse<IEarningStatResponse>> {
    req.targetId = studio._id.toString();
    const data = await this.earningService.stats(req, {
      includingStudioEarning: true
    });
    return DataResponse.ok(data);
  }

  @Get('/performer/payout')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async performerPayout(
    @Query() req: EarningSearchRequestPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<IEarningStatResponse>> {
    req.targetId = user._id.toString();
    const data = await this.earningService.calculatePayoutRequestStats(req);
    return DataResponse.ok(data);
  }

  @Get('/studio/payout')
  @Roles('studio')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async studioPayout(
    @Query() req: EarningSearchRequestPayload,
    @CurrentUser() studio: StudioDto
  ): Promise<DataResponse<IEarningStatResponse>> {
    req.targetId = studio._id.toString();
    const data = await this.earningService.calculatePayoutRequestStats(req);
    return DataResponse.ok(data);
  }

  @Post('/admin/update-status')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStats(
    @Body() payload: UpdateEarningStatusPayload
  ): Promise<DataResponse<IEarningStatResponse>> {
    const data = await this.earningService.updatePaidStatus(payload);
    return DataResponse.ok(data);
  }

  @Get('/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details(@Param('id') id: string): Promise<DataResponse<EarningDto>> {
    const data = await this.earningService.details(id);
    return DataResponse.ok(data);
  }

  @Get('/performer/pending')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTotalPendingToken(
    @CurrentUser() currentUser: PerformerDto
  ): Promise<DataResponse<any>> {
    const data = await this.earningService.getTotalPendingToken(
      currentUser._id
    );
    return DataResponse.ok(data);
  }
}
