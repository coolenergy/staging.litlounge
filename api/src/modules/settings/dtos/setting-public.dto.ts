export class SettingPublicDto {
  key: string;

  value: any;

  constructor(data?: Partial<SettingPublicDto>) {
    this.key = data.key;
    this.value = data.value;
  }
}
