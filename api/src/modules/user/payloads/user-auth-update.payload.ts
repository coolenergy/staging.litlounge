import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  IsIn,
  IsNumber,
  IsDateString,
  IsBoolean
} from 'class-validator';
import {
  STATUS, ROLE_ADMIN, ROLE_USER, GENDERS
} from '../constants';

export class UserAuthUpdatePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  username: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @IsIn([ROLE_ADMIN, ROLE_USER], { each: true })
  roles: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn([STATUS.ACTIVE, STATUS.INACTIVE, STATUS.PENDING])
  status: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  balance: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(GENDERS)
  gender: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  country: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  dateOfBirth: Date;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  emailVerified: boolean;
}
