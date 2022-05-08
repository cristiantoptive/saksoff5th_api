import { ArrayNotEmpty, IsArray, IsUUID } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { EntityMustExists } from "@app/api/validators";
import { Address } from "@app/api/entities/Address";
import { Card } from "@app/api/entities/Card";
import { AddressTypes } from "@app/api/types";
import { AuthenticatedCommand } from "./AuthenticatedCommand";
import { OrderItemCommand } from "./OrderItemCommand";
import { ValidateNested } from "@app/api/validators/ValidateNested";

@JSONSchema({
  description: "This model is used to create or update user orders",
})
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
  @JSONSchema({
    type: "array",
    items: {
      type: "object",
      $ref: "#/components/schemas/OrderItemCommand",
    },
  })
  public items: OrderItemCommand[];
}
