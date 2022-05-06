/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Upload } from "@app/api/entities/Upload";
import { IProcessor } from "typeorm-fixtures-cli";

export default class UploadProcessor implements IProcessor<Upload> {
  preProcess(name: string, object: any): any {
    // @todo store target file into s3
    return {
      ...object,
      product: Promise.resolve(object.product),
      createdBy: Promise.resolve(object.createdBy),
    };
  }
}
