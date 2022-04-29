import { IsInstance, IsArray, IsUUID } from "class-validator";
import { CreateOrderItemCommand } from "./CreateOrderCommand";

export class UpdateOrderCommand {
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


