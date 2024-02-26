import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Post,
  UseGuards,
  Put,
  Body,
  Param,
  Get
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { Roles } from 'src/modules/auth/decorators';
import { MailerService } from '../services';
import { RoleGuard } from '../../auth/guards';
import { EmailTemplateUpdatePayload } from '../payloads/email-template-update.payload';

@Injectable()
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailService: MailerService) {}

  @Post('/verify')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async verify(
  ): Promise<DataResponse<any>> {
    const data = await this.mailService.verify();
    return DataResponse.ok(data);
  }

  @Put('/templates/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Body() payload: EmailTemplateUpdatePayload,
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const data = await this.mailService.updateTemplate(id, payload);
    return DataResponse.ok(data);
  }

  @Get('/templates')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAll(): Promise<DataResponse<any>> {
    const data = await this.mailService.getAllTemplates();
    return DataResponse.ok(data);
  }

  @Get('/templates/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findOne(
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const data = await this.mailService.findOne(id);
    return DataResponse.ok(data);
  }
}
