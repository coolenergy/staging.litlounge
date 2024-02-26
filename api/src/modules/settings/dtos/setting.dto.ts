import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export interface SettingInterface {
  key: string;
  value: any;
  name: string;
  description: string;
  group: string;
  public: boolean;
  type: string;
  visible: boolean;
  editable: boolean;
  meta: any;
  extra: string;
}

export class SettingDto {
  _id: ObjectId;

  key: string;

  value: any;

  name: string;

  description: string;

  group = 'system';

  public = false;

  type = 'text';

  visible = true;

  meta: any;

  createdAt: Date;

  updatedAt: Date;

  extra: string;

  constructor(data?: Partial<SettingDto>) {
    data && Object.assign(this, pick(data, [
      '_id', 'key', 'value', 'name', 'description', 'type', 'visible', 'public', 'meta', 'createdAt', 'updatedAt', 'extra'
    ]));
  }

  public getValue() {
    if (this.type === 'text' && !this.value) {
      return '';
    }

    return this.value;
  }
}
