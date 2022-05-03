
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Address } from "@app/api/entities/Address";
import { IProcessor } from "typeorm-fixtures-cli";

export default class AddressProcessor implements IProcessor<Address> {
  preProcess(name: string, object: any): any {
    return {
      ...object,
      firstName: object.user.lastName,
      lastName: object.user.firstName,
      user: Promise.resolve(object.user),
    };
  }
}
