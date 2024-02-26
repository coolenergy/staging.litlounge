export const ACTION = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

export const EVENT = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted'
};

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
};

// eslint-disable-next-line no-shadow
export enum ROLE {
  USER = 'user',
  PERFORMER = 'performer',
  STUDIO = 'studio'
}

export const EXCLUDE_FIELDS = ['balance', 'status', 'emailVerified', 'roles'];