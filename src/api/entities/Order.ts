import { Column, Entity, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";

import { mergeByKeys } from "@app/lib/utils/functions";
import { User } from "./User";
import { OrderStatuses } from "@app/api/types";
import { Address } from "./Address";
import { Card } from "./Card";
import { OrderItem } from "./OrderItem";

@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({
    nullable: false,
    enum: OrderStatuses,
  })
  public status: OrderStatuses;

  @CreateDateColumn({
    nullable: false,
  })
  public createdOn: Date;

  @UpdateDateColumn({
    nullable: false,
  })
  public updatedOn: Date;

  @ManyToOne(() => User, user => user.orders, {
    nullable: true,
    onDelete: "SET NULL",
  })
  public placedBy: Promise<User>;

  @ManyToOne(() => Address, address => address.usedForOrderShipping, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  public shippingAddress: Promise<Address>;

  @ManyToOne(() => Address, address => address.usedForOrderBilling, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  public billingAddress: Promise<Address>;

  @ManyToOne(() => Card, card => card.usedForOrder, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  public paymentCard: Promise<Card>;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  public items: Promise<OrderItem[]>;

  public static fromData(data: { [prop: string]: any }): Order {
    return Order.updateData(new Order(), data);
  }

  public static updateData(order: Order, data: { [prop: string]: any }): Order {
    mergeByKeys(
      order,
      data,
      [
        "status",
        "placedBy",
        "shippingAddress",
        "billingAddress",
        "paymentCard",
      ],
    );

    return order;
  }
}
