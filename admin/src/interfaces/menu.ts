import { ISearch } from './utils';

export interface IMenu {
  _id: string;
  title: string;
  path: string;
  internal: boolean;
  parentId: string;
  help: string;
  section: string;
  public: boolean;
  ordering: number;
  isOpenNewTab: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMenuCreate {
  title: string;
  path: string;
  internal: boolean;
  parentId: string;
  help: string;
  section: string;
  public: boolean;
  ordering: number;
  isOpenNewTab: boolean;
}

export interface IMenuUpdate {
  _id: string;
  title: string;
  path: string;
  internal: boolean;
  parentId: string;
  help: string;
  section: string;
  public: boolean;
  ordering: number;
  isOpenNewTab: boolean;
}

export interface IMenuSearch extends ISearch {
  public?: boolean;
  section?: string;
  sort?: string;
  sortBy?: string;
}
