import { Column, Entity, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, OneToMany, Unique, BeforeInsert } from "typeorm";

import { mergeByKeys, snackCase } from "@app/lib/utils/functions";
import { Product } from "./Product";

@Entity()
@Unique("UQ_PRODUCT_CATEGORY", ["code"])
export class ProductCategory {
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

  @OneToMany(() => Product, product => product.category)
  public products: Promise<Product[]> | Product[];

  @BeforeInsert()
  public async beforeInsert(): Promise<void> {
    if (!this.code) {
      this.code = snackCase(this.name);
    }
  }

  public static fromData(data: { [prop: string]: any }): ProductCategory {
    return ProductCategory.updateData(new ProductCategory(), data);
  }

  public static updateData(category: ProductCategory, data: { [prop: string]: any }): ProductCategory {
    mergeByKeys(
      category,
      {
        ...data,
        code: data.code || snackCase(data.name || category.name),
      },
      [
        "name",
        "code",
      ],
    );

    return category;
  }
}
