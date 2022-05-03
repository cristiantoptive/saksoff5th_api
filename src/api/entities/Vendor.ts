import { Column, Entity, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, BeforeInsert, ManyToOne } from "typeorm";

import { mergeByKeys, snackCase } from "@app/lib/utils/functions";
import { User } from "./User";

@Entity()
export class Vendor {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: 200,
  })
  public name: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: 255,
  })
  public code: string;

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
  })
  public createdBy: Promise<User>;

  @BeforeInsert()
  public async beforeInsert(): Promise<void> {
    if (!this.code) {
      this.code = snackCase(this.name);
    }
  }

  public static fromData(data: { [prop: string]: any }): Vendor {
    return Vendor.updateData(new Vendor(), data);
  }

  public static updateData(vendor: Vendor, data: { [prop: string]: any }): Vendor {
    mergeByKeys(
      vendor,
      {
        ...data,
        code: data.code || snackCase(data.name || vendor.name),
      },
      [
        "name",
        "code",
        "createdBy",
      ],
    );

    return vendor;
  }
}
