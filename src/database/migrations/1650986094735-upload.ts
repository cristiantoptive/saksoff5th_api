import { Service } from "typedi";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

@Service()
export class upload1650986094735 implements MigrationInterface {
    name = "upload1650986094735"

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: "upload",
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
            name: "relatedTo",
            type: "enum",
            enum: ["product"],
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "description",
            type: "longtext",
            isNullable: true,
          },
          {
            name: "type",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "size",
            type: "float",
            isNullable: true,
          },
          {
            name: "s3Object",
            type: "text",
            isNullable: true,
          },
          {
            name: "productId",
            type: "varchar",
            length: "36",
            isNullable: true,
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
            name: "FK_UPLOAD_PRODUCT",
            columnNames: ["productId"],
            referencedTableName: "product",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
            onUpdate: "NO ACTION",
          },
          {
            name: "FK_UPLOAD_USER",
            columnNames: ["createdById"],
            referencedTableName: "user",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
            onUpdate: "NO ACTION",
          },
        ],
      }), true, true, true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey("upload", "FK_UPLOAD_PRODUCT");
      await queryRunner.dropForeignKey("upload", "FK_UPLOAD_USER");
      await queryRunner.dropTable("upload", true, true, true);
    }
}
