import { Column, Entity, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

import { mergeByKeys } from "@app/lib/utils/functions";
import { Order } from "./Order";
import { Product } from "./Product";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({
    nullable: false,
    type: "float",
  })
  public price: number;

  @Column({
    nullable: false,
    type: "bigint",
  })
  public quantity: number;

  @CreateDateColumn({
    nullable: false,
  })
  public createdOn: Date;

  @ManyToOne(() => Product, {
    nullable: true,
    onDelete: "SET NULL",
  })
  public product: Promise<Product>;

  @ManyToOne(() => Order, order => order.items, {
    nullable: false,
    onDelete: "CASCADE",
  })
  public order: Promise<Order>;

  public static fromData(data: { [prop: string]: any }): OrderItem {
    return OrderItem.updateData(new OrderItem(), data);
  }

  public static updateData(orderItem: OrderItem, data: { [prop: string]: any }): OrderItem {
    mergeByKeys(
      orderItem,
      data,
      [
        "price",
        "quantity",
        "product",
        "order",
      ],
    );

    return orderItem;
  }
}
