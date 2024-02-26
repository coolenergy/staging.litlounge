import {
  IsString, MinLength, IsNotEmpty, IsOptional, MaxLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordChangePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  source = 'user';

  @ApiProperty()
  @IsOptional()
  @IsString()
  type = 'email';

  @IsString()
  @MinLength(6)
  @MaxLength(14)
  @IsNotEmpty()
  password: string;

  @IsString()
  @MinLength(6)
  @MaxLength(14)
  @IsNotEmpty()
  prePassword: string;
}

export class PasswordUserChangePayload {
  @ApiProperty()
  @IsOptional()
  @IsString()
  type = 'email';

  @ApiProperty()
  @IsOptional()
  @IsString()
  source: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(14)
  @IsNotEmpty()
  password: string;
}
