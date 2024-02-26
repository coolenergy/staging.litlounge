import { ISearch } from './utils';

export interface IStudio {
  _id: string;
  name: string;
  username: string;
  email: string;
  status: string;
  phone: string;
  country: string;
  city: string;
  state: string;
  zipcode: string;
  address: string;
  languages: string[];
  roles: string[];
  timezone: string;
  bankTransferOption: {
    type: string;
    withdrawCurrency: string;
    taxPayer: string;
    bankName: string;
    bankAddress: string;
    bankCity: string;
    bankState: string;
    bankZip: string;
    bankCountry: string;
    bankAcountNumber: string;
    bankSWIFTBICABA: string;
    holderOfBankAccount: string;
    additionalInformation: string;
    payPalAccount: string;
    checkPayable: string;
  };
  directDeposit: {
    depositFirstName: string;
    depositLastName: string;
    accountingEmail: string;
    directBankName: string;
    accountType: string;
    accountNumber: string;
    routingNumber: string;
  };
  paxum: {
    paxumName: string;
    paxumEmail: string;
    paxumAdditionalInformation: string;
  };
  bitpay: {
    bitpayName: string;
    bitpayEmail: string;
    bitpayAdditionalInformation: string;
  };
  createdAt: Date;
  updatedAt: Date;
  balance: number;
  emailVerified?: boolean;
  documentVerificationId: string;
  documentVerificationFile: null;
  tipCommission: number;
  privateCallCommission: number;
  groupCallCommission: number;
  productCommission: number;
  albumCommission: number;
  videoCommission: number;
}

export interface IStudioSearch extends ISearch {
  role?: string;
}

export interface IStudioCommission {
  studioCommission: number;
}

export interface IStudioUpdate {
  name: string;
  country: string;
  city: string;
  state: string;
  zipcode: string;
  address: string;
  languages: string[];
  timezone: string;
  status: string;
  email: string;
  phone: string;
  password: string;
}
export interface IStudioCommissionSetting {
  studioId?: string;
  tipCommission: number;
  privateCallCommission: number;
  groupCallCommission: number;
  productCommission: number;
  albumCommission: number;
  videoCommission: number;
}