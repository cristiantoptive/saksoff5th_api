import { Column, Entity, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne, Unique, OneToMany } from "typeorm";

import { mergeByKeys } from "@app/lib/utils/functions";
import { User } from "./User";
import { Vendor } from "./Vendor";
import { ProductCategory } from "./ProductCategory";
import { Upload } from "./Upload";

@Entity()
@Unique("UQ_PRODUCT_SKU", ["SKU"])
export class Product {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: 255,
  })
  public SKU: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: 255,
  })
  public title: string;

  @Column({
    nullable: true,
    type: "longtext",
  })
  public description: string;

  @Column({
    nullable: false,
    type: "float",
  })
  public price: number;

  @Column({
    nullable: false,
    type: "bigint",
  })
  public inventory: number;

  @Column({
    nullable: false,
    type: "varchar",
    length: 255,
  })
  public deliveryTime: string;

  @Column({
    nullable: false,
    type: "bit",
  })
  public isActive: boolean;

  @CreateDateColumn({
    nullable: false,
  })
  public createdOn: Date;

  @UpdateDateColumn({
    nullable: false,
  })
  public updatedOn: Date;

  @ManyToOne(() => User, user => user.products, {
    onDelete: "SET NULL",
    nullable: true,
  })
  public createdBy: Promise<User>;

  @ManyToOne(() => Vendor, vendor => vendor.products, {
    onDelete: "SET NULL",
    nullable: true,
  })
  public vendor: Promise<Vendor>;

  @ManyToOne(() => ProductCategory, category => category.products, {
    onDelete: "SET NULL",
    nullable: true,
  })
  public category: Promise<ProductCategory>;

  @OneToMany(() => Upload, upload => upload.product)
  public images: Promise<Upload[]>;

  public static fromData(data: { [prop: string]: any }): Product {
    return Product.updateData(new Product(), data);
  }

  public static updateData(product: Product, data: { [prop: string]: any }): Product {
    mergeByKeys(
      product,
      data,
      [
        "SKU",
        "title",
        "description",
        "price",
        "inventory",
        "deliveryTime",
        "isActive",
        "createdBy",
        "vendor",
        "category",
      ],
    );

    return product;
  }
}
