import { IsArray, IsEnum, IsInstance, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ViewModel } from "./ViewModel";
import { Order } from "@app/api/entities/Order";
import { OrderStatuses } from "@app/api/types";
import { AddressViewModel } from "./AddressViewModel";
import { CardViewModel } from "./CardViewModel";
import { OrderItemViewModel } from "./OrderItemViewModel";

@JSONSchema({
  description: "Order view model",
})
export class OrderViewModel extends ViewModel {
  @IsString()
  public id: string;

  @IsEnum(OrderStatuses)
  public status: string;

  @IsInstance(AddressViewModel)
  public shippingAddress: AddressViewModel;

  @IsInstance(AddressViewModel)
  public billingAddress: AddressViewModel;

  @IsInstance(CardViewModel)
  public paymentCard: CardViewModel;

  @IsArray()
  @IsInstance(OrderItemViewModel, {
    each: true,
  })
  public items: OrderItemViewModel[];

  public construct(order: Order): Promise<OrderViewModel> {
    return super.mapObjectKeys({
      id: order.id,
      status: order.status,
      shippingAddress: ViewModel.createOne(AddressViewModel, order.shippingAddress),
      billingAddress: ViewModel.createOne(AddressViewModel, order.billingAddress),
      paymentCard: ViewModel.createOne(CardViewModel, order.paymentCard),
      items: ViewModel.createMany(OrderItemViewModel, order.items),
    });
  }
}
