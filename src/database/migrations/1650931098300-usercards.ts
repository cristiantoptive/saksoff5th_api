import { Service } from "typedi";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

@Service()
export class usercards1650931098300 implements MigrationInterface {
  name = "usercards1650931098300"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "card",
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
          length: "255",
          isNullable: false,
        },
        {
          name: "number",
          type: "varchar",
          length: "22",
          isNullable: false,
        },
        {
          name: "expiresOn",
          type: "date",
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
          name: "FK_CARD_USER",
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
    await queryRunner.dropForeignKey("card", "FK_CARD_USER");
    await queryRunner.dropTable("card", true, true, true);
  }
}
