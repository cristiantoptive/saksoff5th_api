import { Service } from "typedi";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

@Service()
export class vendor1650986094732 implements MigrationInterface {
    name = "vendor1650986094732"

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: "vendor",
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
          {
            name: "createdById",
            type: "varchar",
            length: "36",
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            name: "FK_VENDOR_USER",
            columnNames: ["createdById"],
            referencedTableName: "user",
            referencedColumnNames: ["id"],
            onDelete: "NO ACTION",
            onUpdate: "NO ACTION",
          },
        ],
      }), true, true, true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey("vendor", "FK_VENDOR_USER");
      await queryRunner.dropTable("vendor", true, true, true);
    }
}
