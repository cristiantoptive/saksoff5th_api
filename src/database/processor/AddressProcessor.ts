
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Address } from "@app/api/entities/Address";
import { IProcessor } from "typeorm-fixtures-cli";

export default class AddressProcessor implements IProcessor<Address> {
  preProcess(name: string, object: any): any {
    return {
      ...object,
      user: Promise.resolve(object.user),
    };
  }
}
