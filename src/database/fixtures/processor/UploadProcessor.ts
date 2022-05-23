/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import fs from "fs";
import path from "path";

import { Upload } from "@app/api/entities/Upload";
import { IProcessor } from "typeorm-fixtures-cli";
import { env } from "@app/env";
import { createS3Client } from "@app/lib/utils/functions";

export default class UploadProcessor implements IProcessor<Upload> {
  async preProcess(name: string, object: any): Promise<any> {
    let s3Object = null;

    if (!env.isTest) {
      const s3 = createS3Client();
      const filePath = path.resolve(__dirname, "..", "assets", object.name);
      const file = await (new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      }));

      s3Object = await s3
        .upload({
          Bucket: env.s3.bucketName,
          Key: `${object.id}_${object.name}`,
          Body: file,
        })
        .promise();
    }

    return {
      ...object,
      s3Object,
      product: Promise.resolve(object.product),
      createdBy: Promise.resolve(object.createdBy),
    };
  }
}
