import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  IsIn,
  IsNumber,
  IsBoolean
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserCreatePayload } from './user-create.payload';
import { STATUS, ROLE_USER, ROLE_ADMIN } from '../constants';

export class UserAuthCreatePayload extends UserCreatePayload {
  @ApiProperty()
  @IsString()
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
  @IsIn([STATUS.ACTIVE, STATUS.INACTIVE, STATUS.PENDING])
  status: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  balance: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  emailVerified: boolean;

  constructor(params: Partial<UserAuthCreatePayload>) {
    super(params);
    if (params) {
      this.roles = params.roles;
      this.password = params.password;
      this.balance = params.balance;
    }
  }
}
