import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { HttpError } from "routing-controllers";
import AWS from "aws-sdk";
import fs from "fs";
import imagemagick from "imagemagick";

import { ProductsService } from "@app/api/services";
import { UploadRepository } from "@app/api/repositories";
import { CreateUploadCommand, UpdateUploadCommand } from "@app/api/commands";
import { Upload } from "@app/api/entities/Upload";
import { UploadFile, UploadRelatedTo } from "@app/api/types/UploadFile";
import { tempfile } from "@app/lib/utils/functions";
import { env } from "@app/env";

const MAX_CAPACITY = 5 * 1000 * 1000 * 1000; // Only 5gb has our S3 bucket
const MAX_FILE_SIZE = 10 * 1000 * 1000; // Only 10mb per file
const ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpeg", "image/gif"];

@Service()
export class UploadService {
  @InjectRepository() private uploadRepository: UploadRepository;
  @Inject() private productsService: ProductsService;

  private s3: AWS.S3 = new AWS.S3({
    credentials: {
      accessKeyId: env.s3.accessKeyId,
      secretAccessKey: env.s3.secretAccessKey,
    },
  });

  public async findOne(id: string): Promise<Upload | undefined> {
    return await this.uploadRepository.findOneOrFail(id);
  }

  public async create(command: CreateUploadCommand, file: UploadFile): Promise<Upload> {
    const { totalSize } = await this.uploadRepository
      .createQueryBuilder("upload")
      .where("upload.size IS NOT NULL")
      .select("SUM(upload.size) AS totalSize")
      .getRawOne();

    if ((parseFloat(totalSize) + (file.size || command.size)) > (MAX_CAPACITY)) {
      throw new HttpError(400, "No more storage capacity to save new files.");
    }

    if ((file.size || command.size) > MAX_FILE_SIZE) {
      throw new HttpError(400, "File too big.");
    }

    // parameterizar tipos
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype || command.type)) {
      throw new HttpError(400, "File type not allowed.");
    }

    const upload = Upload.fromData({
      source: command.source,
      name: file.originalname || command.name,
      description: command.description,
      type: file.mimetype || command.type,
      size: file.size || command.size,
      relatedTo: command.source,
      product: command.source === UploadRelatedTo.Product ? await this.productsService.find(command.sourceId) : undefined,
    });

    await this.uploadRepository.save(upload);

    try {
      let body = file.buffer;
      if (command.source === UploadRelatedTo.Product) {
        const tempfilePath = tempfile();
        fs.writeFileSync(tempfilePath, body);

        body = await (new Promise((resolve, reject) => {
          imagemagick.resize({
            srcPath: tempfilePath,
            dstPath: tempfilePath,
            width: 512,
            quality: 0.9,
          }, (err: Error) => {
            if (err) {
              fs.unlinkSync(tempfilePath);
              reject(err);
            } else {
              const output = fs.readFileSync(tempfilePath);
              fs.unlinkSync(tempfilePath);
              resolve(output);
            }
          });
        }));

        upload.size = body.length;
      }

      upload.s3Object = await this.s3
        .upload({
          Bucket: env.s3.bucketName,
          Key: `${upload.id}_${upload.name}`,
          Body: body,
        })
        .promise();

      await this.uploadRepository.save(upload);
    } catch (e) {
      this.uploadRepository.remove(upload);
      throw e;
    }

    return upload;
  }

  public async update(id: string, command: UpdateUploadCommand): Promise<Upload> {
    const upload = await this.findOne(id);
    Upload.updateData(upload, command);
    return this.uploadRepository.save(upload);
  }

  public async delete(id: string): Promise<boolean> {
    const upload = await this.uploadRepository.remove(await this.findOne(id));
    return !upload.id;
  }

  public async download(id: string): Promise<{ name: string, content: AWS.S3.Body }> {
    const upload = await this.findOne(id);

    const object: AWS.S3.GetObjectOutput = await this.s3
      .getObject({
        Bucket: upload.s3Object.Bucket,
        Key: upload.s3Object.Key,
      })
      .promise();

    return {
      name: upload.name,
      content: object.Body,
    };
  }
}
