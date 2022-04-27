import { Service } from "typedi";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

@Service()
export class productcategory1650986094733 implements MigrationInterface {
    name = "productcategory1650986094733"

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: "product_category",
        columns: [
          {
            name: "id",
            type: "varchar",
            length: "36",
            isNullable: false,
            isPrimary: true,
          },
          {
            name: "name",
            type: "varchar",
            length: "200",
            isNullable: false,
          },
          {
            name: "code",
            type: "varchar",
            length: "255",
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
        ],
        uniques: [
          {
            name: "UQ_PRODUCT_CATEGORY",
            columnNames: ["code"],
          },
        ],
      }), true, true, true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropIndex("product_category", "UQ_PRODUCT_CATEGORY");
      await queryRunner.dropTable("product_category", true, true, true);
    }
}
