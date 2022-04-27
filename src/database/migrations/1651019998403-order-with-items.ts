import { Service } from "typedi";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

@Service()
export class orderWithItems1651019998403 implements MigrationInterface {
  name = "orderWithItems1651019998403"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "order",
      columns: [
        {
          name: "id",
          type: "varchar",
          length: "36",
          isNullable: false,
          isPrimary: true,
        },
        {
          name: "status",
          type: "enum",
          enum: ["placed", "approved"],
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
          name: "placedById",
          type: "varchar",
          length: "36",
          isNullable: true,
        },
        {
          name: "shippingAddressId",
          type: "varchar",
          length: "36",
          isNullable: false,
        },
        {
          name: "billingAddressId",
          type: "varchar",
          length: "36",
          isNullable: false,
        },
        {
          name: "paymentCardId",
          type: "varchar",
          length: "36",
          isNullable: false,
        },
      ],
      foreignKeys: [
        {
          name: "FK_ORDER_USER",
          columnNames: ["placedById"],
          referencedTableName: "user",
          referencedColumnNames: ["id"],
          onDelete: "SET NULL",
          onUpdate: "NO ACTION",
        },
        {
          name: "FK_ORDER_SHIPPING_ADDRESS",
          columnNames: ["shippingAddressId"],
          referencedTableName: "address",
          referencedColumnNames: ["id"],
          onDelete: "RESTRICT",
          onUpdate: "RESTRICT",
        },
        {
          name: "FK_ORDER_BILLING_ADDRESS",
          columnNames: ["billingAddressId"],
          referencedTableName: "address",
          referencedColumnNames: ["id"],
          onDelete: "RESTRICT",
          onUpdate: "RESTRICT",
        },
        {
          name: "FK_ORDER_PAYMENT_CARD",
          columnNames: ["paymentCardId"],
          referencedTableName: "card",
          referencedColumnNames: ["id"],
          onDelete: "RESTRICT",
          onUpdate: "RESTRICT",
        },
      ],
    }), true, true, true);

    await queryRunner.createTable(new Table({
      name: "order_item",
      columns: [
        {
          name: "id",
          type: "varchar",
          length: "36",
          isNullable: false,
          isPrimary: true,
        },
        {
          name: "price",
          type: "float",
          isNullable: false,
        },
        {
          name: "quantity",
          type: "bigint",
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
          name: "productId",
          type: "varchar",
          length: "36",
          isNullable: true,
        },
        {
          name: "orderId",
          type: "varchar",
          length: "36",
          isNullable: false,
        },
      ],
      foreignKeys: [
        {
          name: "FK_ORDER_ITEM_PRODUCT",
          columnNames: ["productId"],
          referencedTableName: "product",
          referencedColumnNames: ["id"],
          onDelete: "SET NULL",
          onUpdate: "NO ACTION",
        },
        {
          name: "FK_ORDER_ITEM_ORDER",
          columnNames: ["orderId"],
          referencedTableName: "order",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "NO ACTION",
        },
      ],
    }), true, true, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("order_item", "FK_ORDER_ITEM_PRODUCT");
    await queryRunner.dropForeignKey("order_item", "FK_ORDER_ITEM_ORDER");
    await queryRunner.dropForeignKey("order", "FK_ORDER_USER");
    await queryRunner.dropForeignKey("order", "FK_ORDER_SHIPPING_ADDRESS");
    await queryRunner.dropForeignKey("order", "FK_ORDER_BILLING_ADDRESS");
    await queryRunner.dropForeignKey("order", "FK_ORDER_PAYMENT_CARD");

    await queryRunner.dropTable("order_item", true, true, true);
    await queryRunner.dropTable("order", true, true, true);
  }
}
