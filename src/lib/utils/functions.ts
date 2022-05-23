import path from "path";
import { v4 as uuidv4 } from "uuid";
import tempDirectory from "temp-dir";
import AWS from "aws-sdk";
import { env } from "@app/env";

function mergeByKeys(targetObj: { [prop: string]: any }, dataObj: { [prop: string]: any }, keys: string[]): void {
  keys.forEach(key => {
    if (dataObj.hasOwnProperty(key)) {
      targetObj[key] = dataObj[key];
    }
  });
}

function snackCase(text: string): string {
  return (text || "")
    .trim()
    .toUpperCase()
    .replace(/\s/g, "_");
}

function tempfile(extension = ""): string {
  return path.join(tempDirectory, uuidv4() + extension);
}

function delay(ms: number): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });
}

function createS3Client(): AWS.S3 {
  const s3: AWS.S3 = new AWS.S3({
    credentials: {
      accessKeyId: env.s3.accessKeyId,
      secretAccessKey: env.s3.secretAccessKey,
    },
    endpoint: env.isProduction ? undefined : env.s3.endpoint,
  });

  return s3;
}

export {
  mergeByKeys,
  snackCase,
  tempfile,
  createS3Client,
  delay,
};
