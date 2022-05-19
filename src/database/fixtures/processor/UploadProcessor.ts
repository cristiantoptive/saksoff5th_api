/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import fs from "fs";
import path from "path";
import AWS from "aws-sdk";

import { Upload } from "@app/api/entities/Upload";
import { IProcessor } from "typeorm-fixtures-cli";
import { env } from "@app/env";

export default class UploadProcessor implements IProcessor<Upload> {
  private s3: AWS.S3 = new AWS.S3({
    credentials: {
      accessKeyId: env.s3.accessKeyId,
      secretAccessKey: env.s3.secretAccessKey,
    },
  });

  async preProcess(name: string, object: any): Promise<any> {
    let s3Object = null;

    if (!env.isTest) {
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

      s3Object = await this.s3
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
