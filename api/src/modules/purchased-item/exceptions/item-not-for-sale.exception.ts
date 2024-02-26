import { HttpException, HttpStatus } from "@nestjs/common";
import { ITEM_NOT_FOR_SALE } from "../constants";

export class ItemNotForSaleException extends HttpException  {
  constructor() {
    super(ITEM_NOT_FOR_SALE, HttpStatus.BAD_REQUEST);
  }
}