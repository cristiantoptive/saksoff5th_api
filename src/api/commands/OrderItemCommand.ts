import { IsNumber, IsUUID, Min } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { MoreThan } from "typeorm";
import { EntityMustExists } from "@app/api/validators";
import { Product } from "@app/api/entities/Product";

@JSONSchema({
  description: "This model declares how the order items must be created",
})
export class OrderItemCommand {
  @IsUUID(4, {
    message: "Product must be a valid product uuid",
  })
  @EntityMustExists(Product, {
    mustMatch: (command: OrderItemCommand) => ({
      inventory: MoreThan(command.quantity),
      isActive: true,
    }),
    message: "Product does not exists or is inactive or there are no more stock available",
  })
  public product: Product;

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
