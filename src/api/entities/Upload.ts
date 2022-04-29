import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { mergeByKeys } from "@app/lib/utils/functions";
import { UploadRelatedTo } from "@app/api/types";
import { User } from "./User";
import { Product } from "./Product";

@Entity({
  orderBy: {
    createdOn: "ASC",
  },
})
export class Upload {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @CreateDateColumn({
    nullable: false,
  })
  public createdOn: Date;

  @Column({
    nullable: false,
    enum: UploadRelatedTo,
  })
  public relatedTo: UploadRelatedTo;

  @Column({
    nullable: true,
    type: "varchar",
    length: 255,
  })
  public name: string;

  @Column({
    nullable: true,
    type: "varchar",
    length: 255,
  })
  public type: string;

  @Column({
    nullable: true,
    type: "float",
  })
  public size: number;

  @Column("simple-json", { nullable: true })
  public s3Object: {
    ETag: string;
    Location: string;
    Key: string;
    Bucket: string;
  };

  @ManyToOne(() => Product, product => product.images, {
    nullable: true,
    onDelete: "SET NULL",
  })
  public product: Promise<Product> | Product;

  @ManyToOne(() => User, user => user.uploads, {
    nullable: true,
    onDelete: "SET NULL",
  })
  public createdBy: Promise<User> | User;

  public static fromData(data: { [prop: string]: any }): Upload {
    return Upload.updateData(new Upload(), data);
  }

  public static updateData(upload: Upload, data: { [prop: string]: any }): Upload {
    mergeByKeys(
      upload,
      data,
      [
        "relatedTo",
        "name",
        "type",
        "size",
        "s3Object",
        "product",
        "createdBy",
      ],
    );

    return upload;
  }
}
