import { IsNumber, IsOptional } from "class-validator";

export class Pagination {
  @IsNumber()
  @IsOptional()
  public skip: number;

  @IsNumber()
  @IsOptional()
  public take: number;
}
