import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { OrderByCondition } from "typeorm";

// eslint-disable-next-line no-shadow
enum Order {
  ASC = "ASC",
  DESC = "DESC",
}

class OrderElement {
  @IsNotEmpty()
  public column: string;

  @IsEnum(Order)
  public direction: Order;
}

export class Search {
  public search: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderElement)
  private order?: OrderElement[];

  public get queryOrder(): OrderByCondition {
    return this.order ? this.order.reduce((accum: any, order: any) => ({
      [order.column]: order.direction,
      ...accum,
    }), {}) : undefined;
  }
}
