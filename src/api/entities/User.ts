import * as bcrypt from "bcrypt";
import { Exclude } from "class-transformer";
import { BeforeInsert, Column, Entity, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

import { mergeByKeys } from "@app/lib/utils/functions";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({
    name: "firstName",
    nullable: false,
  })
  public firstName: string;

  @Column({
    name: "lastName",
    nullable: false,
  })
  public lastName: string;

  @Column({
    unique: true,
    nullable: false,
  })
  public email: string;

  @Column({
    nullable: false,
  })
  public role: string;

  @Column({
    nullable: false,
  })
  @Exclude()
  public password: string;

  @CreateDateColumn({
    nullable: false,
  })
  public createdOn: Date;

  @UpdateDateColumn({
    nullable: false,
  })
  public updatedOn: Date;

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
