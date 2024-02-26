import {
  Controller,
  Injectable,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Put,
  Param
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse } from 'src/kernel';
import { Roles } from 'src/modules/auth/decorators';
import { ObjectId } from 'mongodb';
import { PerformerCommissionPayload } from '../payloads';
import { PerformerCommissionDto } from '../dtos';
import { PerformerCommissionService } from '../services/performer-commission.service';

@Injectable()
@Controller('admin/performer-commission')
export class AdminPerformerCommissionController {
  constructor(
    private readonly performerCommissionService: PerformerCommissionService
  ) {}

  @Put('/:performerId')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('performerId') performerId: ObjectId,
    @Body() payload: PerformerCommissionPayload
  ): Promise<DataResponse<PerformerCommissionDto>> {
    const data = await this.performerCommissionService.update(
      payload,
      performerId
    );
    return DataResponse.ok(new PerformerCommissionDto(data));
  }
}
