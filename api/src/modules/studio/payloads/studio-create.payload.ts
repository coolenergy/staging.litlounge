import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  Validate
} from 'class-validator';
import { Username } from 'src/modules/user/validators/username.validator';
import { STUDIO_STATUES } from '../constants';

export class StudioCreatePayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(Username)
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class StudioCreateByAdminPayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(Username)
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  documentVerificationId: any;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  commission: number;

  @ApiProperty()
  @IsString()
  @IsIn([
    STUDIO_STATUES.ACTIVE,
    STUDIO_STATUES.INACTIVE,
    STUDIO_STATUES.PENDING
  ])
  @IsOptional()
  status: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  emailVerified: boolean;
}
