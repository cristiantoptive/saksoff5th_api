import { Service } from "typedi";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

@Service()
export class user1650586971872 implements MigrationInterface {
  name = "user1650586971872"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "user",
      columns: [
        {
          name: "id",
          type: "varchar",
          length: "36",
          isNullable: false,
          isPrimary: true,
        },
        {
          name: "email",
          type: "varchar",
          length: "255",
          isNullable: false,
        },
        {
          name: "password",
          type: "varchar",
          length: "255",
          isNullable: false,
        },
        {
          name: "role",
          type: "enum",
          enum: ["admin", "customer", "merchandiser"],
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
          name: "UQ_USER_EMAIL",
          columnNames: ["email"],
        },
      ],
    }), true, true, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("user", "UQ_USER_EMAIL");
    await queryRunner.dropTable("user", true, true, true);
  }
}
