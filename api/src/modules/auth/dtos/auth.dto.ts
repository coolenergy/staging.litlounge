import { ObjectId } from 'mongodb';

export class AuthCreateDto {
  source = 'user';

  sourceId: ObjectId;

  type = 'email';

  key?: string;

  value?: string;

  constructor(data: Partial<AuthCreateDto>) {
    this.source = data.source || 'user';
    this.type = data.type || 'email';
    this.sourceId = data.sourceId;
    this.key = data.key;
    this.value = data.value;
  }
}

export class AuthUpdateDto extends AuthCreateDto {}
