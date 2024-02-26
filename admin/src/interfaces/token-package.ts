import { ISearch } from "./utils";

export interface ITokenPackage {
  _id: string;
  name: string;
  description: string;
  ordering: number;
  price: number;
  isActive: boolean;
  tokens: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface ITokenPackageCreate {
  name: string;
  description: string;
  ordering: number;
  isActive: boolean;
  price: number;
  tokens: number;
}

export interface ITokenPackageUpdate {
  _id: string;
  name: string;
  description: string;
  ordering: number;
  isActive: boolean;
  price: number;
  tokens: number;
}

export interface ITokenPackageSearch extends ISearch {
  status?: string;
  name?: string;
}