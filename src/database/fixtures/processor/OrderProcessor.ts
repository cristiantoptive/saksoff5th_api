/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Order } from "@app/api/entities/Order";
import { IProcessor } from "typeorm-fixtures-cli";

export default class OrderProcessor implements IProcessor<Order> {
  preProcess(name: string, object: any): any {
    return {
      ...object,
      placedBy: Promise.resolve(object.placedBy),
      shippingAddress: Promise.resolve(object.shippingAddress),
      billingAddress: Promise.resolve(object.billingAddress),
      paymentCard: Promise.resolve(object.paymentCard),
    };
  }
}
