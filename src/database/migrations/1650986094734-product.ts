import { Service } from "typedi";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

@Service()
export class product1650986094734 implements MigrationInterface {
    name = "product1650986094734"

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: "product",
        columns: [
          {
            name: "id",
            type: "varchar",
            length: "36",
            isNullable: false,
            isPrimary: true,
          },
          {
            name: "SKU",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "description",
            type: "longtext",
            isNullable: true,
          },
          {
            name: "price",
            type: "float",
            isNullable: false,
          },
          {
            name: "inventory",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "deliveryTime",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "isActive",
            type: "bit",
            isNullable: false,
          },
          {
            name: "createdOn",
            type: "datetime",
            length: "6",
            isNullable: false,
            default: "CURRENT_TIMESTAMP(6)",
          },
          {
            name: "updatedOn",
            type: "datetime",
            length: "6",
            isNullable: false,
            default: "CURRENT_TIMESTAMP(6)",
            onUpdate: "CURRENT_TIMESTAMP(6)",
          },
          {
            name: "createdById",
            type: "varchar",
            length: "36",
            isNullable: true,
          },
          {
            name: "vendorId",
            type: "varchar",
            length: "36",
            isNullable: true,
          },
          {
            name: "categoryId",
            type: "varchar",
            length: "36",
            isNullable: true,
          },
        ],
        uniques: [
          {
            name: "UQ_PRODUCT_SKU",
            columnNames: ["SKU"],
          },
        ],
        foreignKeys: [
          {
            name: "FK_PRODUCT_USER",
            columnNames: ["createdById"],
            referencedTableName: "user",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
            onUpdate: "NO ACTION",
          },
          {
            name: "FK_PRODUCT_VENDOR",
            columnNames: ["vendorId"],
            referencedTableName: "vendor",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
            onUpdate: "NO ACTION",
          },
          {
            name: "FK_PRODUCT_CATEGORY",
            columnNames: ["categoryId"],
            referencedTableName: "product_category",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
            onUpdate: "NO ACTION",
          },
        ],
      }), true, true, true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropUniqueConstraint("product", "UQ_PRODUCT_SKU");
      await queryRunner.dropForeignKey("product", "FK_PRODUCT_USER");
      await queryRunner.dropForeignKey("product", "FK_PRODUCT_VENDOR");
      await queryRunner.dropForeignKey("product", "FK_PRODUCT_CATEGORY");
      await queryRunner.dropTable("product", true, true, true);
    }
}
