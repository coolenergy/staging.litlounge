export interface IOrder {
  _id: string;
  transactionId: string;
  performerId: string;
  performerInfo?: any;
  userId: string;
  userInfo?: any;
  orderNumber: string;
  shippingCode: string;
  productIds: string[];
  productsInfo: any[];
  quantity: number;
  totalPrice: number;
  deliveryAddress?: string;
  deliveryStatus: string;
  postalCode?: string;
  createdAt: Date;
  updatedAt: Date;
}
