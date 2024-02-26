import {
  IsString, IsOptional, IsBoolean, IsObject
} from 'class-validator';

export class SettingCreatePayload {
  @IsString()
  key: string;

  @IsOptional()
  value: any;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  group: string;

  @IsBoolean()
  @IsOptional()
  public: boolean;

  @IsString()
  @IsOptional()
  type: string;

  @IsBoolean()
  @IsOptional()
  visible: boolean;

  @IsBoolean()
  @IsOptional()
  editable: boolean;

  @IsOptional()
  @IsObject()
  meta: any;
}
