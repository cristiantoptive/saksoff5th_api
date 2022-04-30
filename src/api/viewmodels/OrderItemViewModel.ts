import { IsInstance, IsNumber, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ViewModel } from "./ViewModel";
import { OrderItem } from "@app/api/entities/OrderItem";
import { ProductViewModel } from "./ProductViewModel";

@JSONSchema({
  description: "Order item view model",
})
export class OrderItemViewModel extends ViewModel {
  @IsString()
  public id: string;

  @IsNumber()
  public price: number;

  @IsNumber()
  public quantity: number;

  @IsInstance(ProductViewModel)
  public product: ProductViewModel;

  public construct(item: OrderItem): Promise<OrderItemViewModel> {
    return super.mapObjectKeys({
      id: item.id,
      price: item.price,
      quantity: item.quantity,
      product: ViewModel.createOne(ProductViewModel, item.product),
    });
  }
}
