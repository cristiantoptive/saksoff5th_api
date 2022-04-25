import { IsNumber } from "class-validator";

export class Pagination {
  @IsNumber()
  public skip: number;

  @IsNumber()
  public take: number;
}
