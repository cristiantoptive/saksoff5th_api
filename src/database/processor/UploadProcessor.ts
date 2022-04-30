import { Upload } from "@app/api/entities/Upload";
import { IProcessor } from "typeorm-fixtures-cli";

export default class UploadProcessor implements IProcessor<Upload> {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  preProcess(name: string, object: any): any {
    // @todo store target file into s3
    return object;
  }
}
