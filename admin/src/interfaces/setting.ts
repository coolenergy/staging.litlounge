export interface ISetting {
  _id: string;
  key: string;
  value: any;
  name: string;
  description: string;
  group: string;
  public: boolean;
  type: string;
  visible: boolean;
  meta: {[key: string]: any};
  createdAt: Date;
  updatedAt: Date;
  rules: any;
  extra: string;
}