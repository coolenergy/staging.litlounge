/* eslint-disable no-shadow */
export enum ResultStatus {
  OK,
  FAIL,
  ERROR
}

export class DataResponse<D> {
  constructor(
    public readonly status: ResultStatus,
    public readonly data?: D,
    public readonly message?: string,
    public readonly error?: Error
  ) {
  }

  isOk() {
    return this.status === ResultStatus.OK;
  }

  isFail() {
    return this.status === ResultStatus.FAIL;
  }

  isError() {
    return this.status === ResultStatus.ERROR;
  }

  static ok<D>(data?: D) {
    return new DataResponse(ResultStatus.OK, data);
  }

  static fail<D>(error: Error) {
    return new DataResponse<D>(ResultStatus.FAIL, (error as any).data, error.message, error);
  }

  static error<D>(error: Error, data?: D) {
    return new DataResponse(ResultStatus.ERROR, data, error.message, error);
  }
}
