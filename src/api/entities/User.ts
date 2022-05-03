import * as bcrypt from "bcrypt";
import { BeforeInsert, Column, Entity, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, Unique } from "typeorm";

import { mergeByKeys } from "@app/lib/utils/functions";
import { UserRoles, Roles } from "@app/api/types";

@Entity()
@Unique("UQ_USER_EMAIL", ["email"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: 255,
  })
  public email: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: 255,
  })
  public password: string;

  @Column({
    nullable: false,
    enum: UserRoles,
  })
  public role: Roles;

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

  @CreateDateColumn({
    nullable: false,
  })
  public createdOn: Date;

  @UpdateDateColumn({
    nullable: false,
  })
  public updatedOn: Date;

  // @OneToMany(() => Address, address => address.user)
  // public addresses: Promise<Address[]>;

  // @OneToMany(() => Card, card => card.user)
  // public cards: Promise<Card[]>;

  // @OneToMany(() => Vendor, vendor => vendor.createdBy)
  // public vendors: Promise<Vendor[]>;

  // @OneToMany(() => Product, product => product.createdBy)
  // public products: Promise<Product[]>;

  // @OneToMany(() => Upload, upload => upload.createdBy)
  // public uploads: Promise<Upload[]>;

  // @OneToMany(() => Order, order => order.placedBy)
  // public orders: Promise<Order[]>;

  @BeforeInsert()
  public async beforeInsert(): Promise<void> {
    this.password = await User.hashPassword(this.password);
  }

  public toString(): string {
    return `${this.firstName} ${this.lastName} (${this.email})`;
  }

  public static hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
  }

  public static comparePassword(user: User, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res === true);
        }
      });
    });
  }

  public static fromData(data: { [prop: string]: any }): User {
    return User.updateData(new User(), data);
  }

  public static updateData(user: User, data: { [prop: string]: any }): User {
    mergeByKeys(
      user,
      data,
      [
        "email",
        "role",
        "firstName",
        "lastName",
        "password",
      ],
    );

    return user;
  }
}
