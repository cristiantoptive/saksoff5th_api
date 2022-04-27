import { Service } from "typedi";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

@Service()
export class errorlog1650586971872 implements MigrationInterface {
  name = "errorlog1650586971872"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "error_log",
      columns: [
        {
          name: "id",
          type: "varchar",
          length: "36",
          isNullable: false,
          isPrimary: true,
        },
        {
          name: "createdOn",
          type: "datetime",
          length: "6",
          isNullable: false,
          default: "CURRENT_TIMESTAMP(6)",
        },
        {
          name: "name",
          type: "longtext",
          isNullable: true,
        },
        {
          name: "stack",
          type: "longtext",
          isNullable: true,
        },
        {
          name: "message",
          type: "longtext",
          isNullable: true,
        },
      ],
    }), true, true, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("error_log", true, true, true);
  }
}
