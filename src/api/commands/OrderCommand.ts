import { IsInstance, IsArray, IsNumber, IsUUID, Min } from "class-validator";
import { EntityMustExists } from "@app/api/validators";
import { Address } from "@app/api/entities/Address";
import { Card } from "../entities/Card";
import { Product } from "../entities/Product";
import { AddressTypes } from "../types";
import { AuthenticatedCommand } from "./AuthenticatedCommand";

export class OrderItemCommand {
  @IsUUID(4, {
    message: "Product must be a valid product uuid",
  })
  @EntityMustExists(Product, {
    message: "Product does not exists",
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
    mustMatch: {
      user: "@currentUser",
      type: AddressTypes.Shipping,
    },
    message: "Shipping address does not exists or does not belongs to the current user",
  })
  public shippingAddress: Address;

  @IsUUID(4, {
    message: "Billing address must be a valid billing address uuid",
  })
  @EntityMustExists(Address, {
    mustMatch: {
      user: "@currentUser",
      type: AddressTypes.Billing,
    },
    message: "Billing address does not exists or does not belongs to the current user",
  })
  public billingAddress: Address;

  @IsUUID(4, {
    message: "Payment card must be a valid user card uuid",
  })
  @EntityMustExists(Card, {
    mustMatch: {
      user: "@currentUser",
    },
    message: "Payment card does not exists or does not belongs to the current user",
  })
  public card: Card;

  @IsArray()
  @IsInstance(OrderItemCommand, {
    each: true,
  })
  public items: OrderItemCommand[];
}
