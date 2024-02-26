import {
  IsString,
  IsOptional,
  Validate,
  IsEmail,
  IsNotEmpty,
  IsIn,
  IsArray,
  MinLength,
  IsObject
} from 'class-validator';
import { Username } from 'src/modules/user/validators/username.validator';
import { GENDERS } from 'src/modules/user/constants';
import { ApiProperty } from '@nestjs/swagger';
import { PERFORMER_STATUSES } from '../constants';
import { ISchedule } from '../dtos';

export class PerformerUpdatePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @Validate(Username)
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  // @IsNotEmpty()
  @MinLength(6)
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsString()
  @IsIn([PERFORMER_STATUSES.ACTIVE, PERFORMER_STATUSES.INACTIVE, PERFORMER_STATUSES.PENDING])
  @IsOptional()
  status = PERFORMER_STATUSES.ACTIVE;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneCode: string; // international code prefix

  @ApiProperty()
  @IsString()
  @IsOptional()
  avatarId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  headerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  idVerificationId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  documentVerificationId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  releaseFormId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsIn(GENDERS)
  gender: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  country: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  city: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  state: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  zipcode: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds: string[];

  @ApiProperty()
  @IsOptional()
  @IsObject()
  schedule: ISchedule;

  @ApiProperty()
  @IsString()
  @IsOptional()
  timezone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  noteForUser: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  hair: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  eyes: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  height: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  weight: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ethnicity: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  pubicHair: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bust: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  aboutMe: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sexualReference: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  socials?: any;
}

export class AdminUpdatePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @Validate(Username)
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  // @IsNotEmpty()
  @MinLength(6)
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsString()
  @IsIn([PERFORMER_STATUSES.ACTIVE, PERFORMER_STATUSES.INACTIVE])
  @IsOptional()
  status = PERFORMER_STATUSES.ACTIVE;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneCode: string; // international code prefix

  @ApiProperty()
  @IsString()
  @IsOptional()
  avatarId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  headerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  idVerificationId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  documentVerificationId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  releaseFormId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsIn(GENDERS)
  gender: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  country: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  city: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  state: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  zipcode: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds: string[];

  @ApiProperty()
  @IsOptional()
  @IsObject()
  schedule: ISchedule;

  @ApiProperty()
  @IsString()
  @IsOptional()
  timezone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  noteForUser: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  hair: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  eyes: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  height: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  weight: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ethnicity: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  pubicHair: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bust: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  aboutMe: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sexualReference: string;

  @ApiProperty()
  @IsOptional()
  emailVerified?: boolean;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  socials?: any;
}
