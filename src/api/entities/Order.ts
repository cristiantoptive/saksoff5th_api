import { Column, Entity, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";

import { mergeByKeys } from "@app/lib/utils/functions";
import { OrderStatuses } from "@app/api/types";
import { User } from "./User";
import { OrderItem } from "./OrderItem";
import { Address } from "./Address";
import { Card } from "./Card";

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

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: "SET NULL",
  })
  public placedBy: Promise<User>;

  @ManyToOne(() => Address, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  public shippingAddress: Promise<Address>;

  @ManyToOne(() => Address, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  public billingAddress: Promise<Address>;

  @ManyToOne(() => Card, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  public paymentCard: Promise<Card>;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  public items: OrderItem[];

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
