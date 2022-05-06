/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Vendor } from "@app/api/entities/Vendor";
import { IProcessor } from "typeorm-fixtures-cli";

export default class VendorProcessor implements IProcessor<Vendor> {
  preProcess(name: string, object: any): any {
    return {
      ...object,
      createdBy: Promise.resolve(object.createdBy),
      vendor: Promise.resolve(object.vendor),
      category: Promise.resolve(object.category),
    };
  }
}
