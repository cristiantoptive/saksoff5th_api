/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { OrderItem } from "@app/api/entities/OrderItem";
import { IProcessor } from "typeorm-fixtures-cli";

export default class OrderItemProcessor implements IProcessor<OrderItem> {
  preProcess(name: string, object: any): any {
    return {
      ...object,
      price: object.quantity * object.product.price,
      product: Promise.resolve(object.product),
      order: Promise.resolve(object.order),
    };
  }
}
