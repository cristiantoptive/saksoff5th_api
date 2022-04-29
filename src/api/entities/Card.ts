import { Column, Entity, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";

import { mergeByKeys } from "@app/lib/utils/functions";
import { User } from "./User";
import { Order } from "./Order";

@Entity()
export class Card {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: 255,
  })
  public name: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: 19,
  })
  public number: string;

  @Column({
    type: "date",
    nullable: false,
  })
  public expiresOn: Date;

  @CreateDateColumn({
    nullable: false,
  })
  public createdOn: Date;

  @UpdateDateColumn({
    nullable: false,
  })
  public updatedOn: Date;

  @ManyToOne(() => User, user => user.cards, {
    onDelete: "CASCADE",
    nullable: false,
  })
  public user: Promise<User> | User;

  @OneToMany(() => Order, order => order.paymentCard)
  public usedForOrder: Promise<Order[]> | Order[];

  public static fromData(data: { [prop: string]: any }): Card {
    return Card.updateData(new Card(), data);
  }

  public static updateData(card: Card, data: { [prop: string]: any }): Card {
    mergeByKeys(
      card,
      data,
      [
        "name",
        "number",
        "expiresOn",
        "user",
      ],
    );

    return card;
  }
}
