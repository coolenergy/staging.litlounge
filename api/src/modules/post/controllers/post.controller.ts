import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Param,
  Get
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { PostService } from '../services';
import { PostDto } from '../dtos';

@Injectable()
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details(@Param('id') id: string): Promise<DataResponse<PostDto>> {
    const post = await this.postService.getPublic(id);
    return DataResponse.ok(post);
  }
}
