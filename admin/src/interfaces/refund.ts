export interface IRefundRequest {
  _id: any;
  userId: string;
  sourceType?: string;
  sourceId?: string;
  token: number;
  performerId: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  performerInfo?: any;
  userInfo?: any;
  productInfo?: any
}