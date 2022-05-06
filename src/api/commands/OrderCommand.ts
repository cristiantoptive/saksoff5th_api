import { ArrayNotEmpty, IsArray, IsNumber, IsUUID, Min } from "class-validator";
import { MoreThan } from "typeorm";
import { EntityMustExists } from "@app/api/validators";
import { Address } from "@app/api/entities/Address";
import { Card } from "@app/api/entities/Card";
import { Product } from "@app/api/entities/Product";
import { AddressTypes } from "@app/api/types";
import { AuthenticatedCommand } from "./AuthenticatedCommand";
import { ValidateNested } from "@app/api/validators/ValidateNested";

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

export class OrderCommand extends AuthenticatedCommand {
  @IsUUID(4, {
    message: "Shipping address must be a valid shipping address uuid",
  })
  @EntityMustExists(Address, {
    mustMatch: (command: OrderCommand) => ({
      user: command.currentUser,
      type: AddressTypes.Shipping,
    }),
    message: "Shipping address does not exists or does not belongs to the current user",
  })
  public shippingAddress: Address;

  @IsUUID(4, {
    message: "Billing address must be a valid billing address uuid",
  })
  @EntityMustExists(Address, {
    mustMatch: (command: OrderCommand) => ({
      user: command.currentUser,
      type: AddressTypes.Billing,
    }),
    message: "Billing address does not exists or does not belongs to the current user",
  })
  public billingAddress: Address;

  @IsUUID(4, {
    message: "Payment card must be a valid user card uuid",
  })
  @EntityMustExists(Card, {
    mustMatch: (command: OrderCommand) => ({
      user: command.currentUser,
    }),
    message: "Payment card does not exists or does not belongs to the current user",
  })
  public card: Card;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested(OrderItemCommand)
  public items: OrderItemCommand[];
}
