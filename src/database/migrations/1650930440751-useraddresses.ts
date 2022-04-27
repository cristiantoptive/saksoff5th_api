import { Service } from "typedi";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

@Service()
export class useraddresses1650930440751 implements MigrationInterface {
  name = "useraddresses1650930440751"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "address",
      columns: [
        {
          name: "id",
          type: "varchar",
          length: "36",
          isNullable: false,
          isPrimary: true,
        },
        {
          name: "type",
          type: "enum",
          enum: ["shipping", "billing"],
          isNullable: false,
        },
        {
          name: "firstName",
          type: "varchar",
          length: "255",
          isNullable: false,
        },
        {
          name: "lastName",
          type: "varchar",
          length: "255",
          isNullable: false,
        },
        {
          name: "line1",
          type: "varchar",
          length: "255",
          isNullable: false,
        },
        {
          name: "line2",
          type: "varchar",
          length: "255",
          isNullable: true,
        },
        {
          name: "city",
          type: "varchar",
          length: "255",
          isNullable: false,
        },
        {
          name: "state",
          type: "varchar",
          length: "255",
          isNullable: false,
        },
        {
          name: "zipcode",
          type: "varchar",
          length: "255",
          isNullable: false,
        },
        {
          name: "country",
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
          name: "userId",
          type: "varchar",
          length: "36",
          isNullable: false,
        },
      ],
      foreignKeys: [
        {
          name: "FK_ADDRESS_USER",
          columnNames: ["userId"],
          referencedTableName: "user",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
          onUpdate: "NO ACTION",
        },
      ],
    }), true, true, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("address", "FK_ADDRESS_USER");
    await queryRunner.dropTable("address", true, true, true);
  }
}
