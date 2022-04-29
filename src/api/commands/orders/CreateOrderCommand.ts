import { IsInstance, IsArray, IsNumber, IsUUID, Min } from "class-validator";

export class CreateOrderItemCommand {
  @IsUUID(4, {
    message: "Product must be a valid product uuid",
  })
  public product: string;

  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  }, {
    message: "Item quantity must be a valid integer number",
  })
  @Min(1, {
    message: "Item quantity must be a positive number greater than 1",
  })
  public quantity: number;
}

export class CreateOrderCommand {
  @IsUUID(4, {
    message: "Shipping address must be a valid shipping address uuid",
  })
  public shippingAddress: string;

  @IsUUID(4, {
    message: "Billing address must be a valid billing address uuid",
  })
  public billingAddress: string;

  @IsUUID(4, {
    message: "Payment card must be a valid user card uuid",
  })
  public card: string;

  @IsArray()
  @IsInstance(CreateOrderItemCommand, {
    each: true,
  })
  public items: CreateOrderItemCommand[];
}


