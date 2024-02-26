import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsNotEmpty, IsString } from "class-validator";

export class ResendVerificationEmailPaload {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsIn(['performer', 'studio', 'user'])
  @IsNotEmpty()
  source: string;
}