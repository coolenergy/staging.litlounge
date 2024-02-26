enum Status {
  OK,
  FAIL,
  ERROR,
}

type Response<Data> = {
  readonly status: Status;
  readonly data?: Data;
  readonly message?: string;
  readonly error?: Error;
};

export type { Response };
