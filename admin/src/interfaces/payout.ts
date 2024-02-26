export interface IPayoutRequest {
  _id: any;
  performerId?: string;
  performerInfo?: any;
  studioId?: string;
  studioInfo?: any;
  paymentAccountType?: string;
  paymentAccountInfo: any;
  fromDate?: Date;
  toDate?: Date;
  requestNote?: string;
  adminNote?: string;
  status?: string;
  sourceType?: string;
  tokenMustPay?: number;
  previousPaidOut?: number;
  pendingToken?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
