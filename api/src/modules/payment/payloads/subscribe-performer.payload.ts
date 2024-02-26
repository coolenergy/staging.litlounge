import { IsNotEmpty, IsIn } from 'class-validator';

export class SubscribePerformerPayload {
  @IsNotEmpty()
  performerId: string;

  @IsNotEmpty()
  @IsIn(['monthly', 'yearly'])
  type: string;
}
