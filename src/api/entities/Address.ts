import { Column, Entity, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

import { mergeByKeys } from "@app/lib/utils/functions";
import { AddressTypes } from "@app/api/types";
import { User } from "./User";

@Entity()
export class Address {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({
    nullable: false,
    enum: AddressTypes,
  })
  public type: AddressTypes;

  @Column({
    nullable: false,
    type: "varchar",
    length: 255,
  })
  public firstName: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: 255,
  })
  public lastName: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: 255,
  })
  public line1: string;

  @Column({
    nullable: true,
    type: "varchar",
    length: 255,
  })
  public line2: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: 255,
  })
  public city: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: 255,
  })
  public state: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: 255,
  })
  public zipcode: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: 255,
  })
  public country: string;

  @CreateDateColumn({
    nullable: false,
  })
  public createdOn: Date;

  @UpdateDateColumn({
    nullable: false,
  })
  public updatedOn: Date;

  @ManyToOne(() => User, user => user.addresses, {
    nullable: false,
    onDelete: "CASCADE",
  })
  public user: Promise<User>;

  public static fromData(data: { [prop: string]: any }): Address {
    return Address.updateData(new Address(), data);
  }

  public static updateData(address: Address, data: { [prop: string]: any }): Address {
    mergeByKeys(
      address,
      data,
      [
        "type",
        "firstName",
        "lastName",
        "line1",
        "line2",
        "city",
        "state",
        "zipcode",
        "country",
        "user",
      ],
    );

    return address;
  }
}
