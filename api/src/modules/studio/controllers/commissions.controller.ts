import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Body,
  Param
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { RoleGuard } from 'src/modules/auth/guards';
import { PerformerSearchPayload } from 'src/modules/performer/payloads';
import { StudioDto } from '../dtos';
import { UpdateCommissionPayload } from '../payloads';
import { StudioCommissionService } from '../services/commission.service';

@Controller('studio/commission')
export class StudioCommissionController {
  constructor(
    private readonly studioCommissionService: StudioCommissionService
  ) {}

  @Get('/')
  @Roles('studio')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(
    @Query() payload: PerformerSearchPayload,
    @CurrentUser() user: StudioDto
  ) {
    const results = await this.studioCommissionService.searchMemberCommissions(
      { ...payload, studioId: user._id.toString() },
      user
    );
    return DataResponse.ok(results);
  }

  @Put('/member/:id')
  @Roles('studio')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateMemberCommission(
    @Param('id') id: string,
    @Body() payload: UpdateCommissionPayload,
    @CurrentUser() studio: StudioDto
  ) {
    const results = await this.studioCommissionService.studioUpdateMemberCommission(
      id,
      payload,
      studio
    );
    return DataResponse.ok(results);
  }

  @Put('/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateCommissionPayload
  ) {
    const results = await this.studioCommissionService.adminUpdateStudioCommission(
      id,
      payload
    );
    return DataResponse.ok(results);
  }
}
