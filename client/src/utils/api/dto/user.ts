import { Entity } from "./entity";

type User = Entity & {
  avatar: string;
  isOnline?: boolean;
  roles: string[];
  username: string;
};

type Me = User & {
  balance?: number;
  city?: string;
  country: string;
  createdAt?: Date;
  dateOfBirth?: Date;
  email: string;
  emailVerified: boolean;
  firstName: string;
  gender?: string;
  lastName: string;
  name: string;
  offlineAt?: Date;
  onlineAt?: Date;
  phone?: string;
  state?: string;
  stats?: {
    totalTokenEarned?: number;
    totalTokenSpent?: number;
    totalViewTime?: number;
  };
  status?: string;
  timezone?: string;
  totalOnlineTime?: number;
};

export type { User, Me };
