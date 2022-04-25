import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { mergeByKeys } from "@app/lib/utils/functions";

@Entity()
export class ErrorLog {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @CreateDateColumn({
    nullable: false,
  })
  public createdOn: Date;

  @Column({
    nullable: true,
    type: "longtext",
  })
  public name: string;

  @Column({
    nullable: true,
    type: "longtext",
  })
  public stack: string;

  @Column({
    nullable: true,
    type: "longtext",
  })
  public message: string;

  public static fromData(data: { [prop: string]: any }): ErrorLog {
    return ErrorLog.updateData(new ErrorLog(), data);
  }

  public static updateData(error: ErrorLog, data: { [prop: string]: any }): ErrorLog {
    mergeByKeys(
      error,
      data,
      [
        "name",
        "stack",
        "message",
        "lastName",
        "password",
      ],
    );

    return error;
  }
}
