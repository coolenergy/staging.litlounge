import { ISearch } from './utils';

export interface IUser {
  _id: string;
  avatar: string;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  email: string;
  balance: string;
  country: string;
  roles: string[];
  dateOfBirth: string;
  emailVerified: boolean;
  stats: {
    totalTokenEarned: number;
    totalTokenSpent: number;
    totalViewTime: number;
  };
}

export interface IUserSearch extends ISearch {
  role?: string;
}
