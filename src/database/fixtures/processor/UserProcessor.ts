/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { User } from "@app/api/entities/User";
import { IProcessor } from "typeorm-fixtures-cli";

export default class UserProcessor implements IProcessor<User> {
  preProcess(name: string, object: any): any {
    return {
      ...object,
    };
  }
}
