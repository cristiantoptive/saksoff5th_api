import AWS from "aws-sdk";
import { Service } from "typedi";
import { EntitySubscriberInterface, EventSubscriber, RemoveEvent } from "typeorm";

import { Upload } from "@app/api/entities/Upload";
import { Product } from "@app/api/entities/Product";
import { ErrorLog } from "@app/api/entities/ErrorLog";
import { env } from "@app/env";
import { Logger, LoggerInterface } from "@app/decorators/Logger";

const DELAY_BEFORE_CHECKING_FOR_ORPHANS_UPLOADS = 1000;

@Service()
@EventSubscriber()
export class UploadsEventSubscriber implements EntitySubscriberInterface {
  @Logger(__filename) private log: LoggerInterface;

  private s3: AWS.S3 = new AWS.S3({
    credentials: {
      accessKeyId: env.s3.accessKeyId,
      secretAccessKey: env.s3.secretAccessKey,
    },
  });

  async afterRemove(event: RemoveEvent<any>): Promise<any> {
    /**
     * If removed entity was an Upload then delete s3 related object
     */
    if (event.entity instanceof Upload) {
      try {
        await this.s3
          .deleteObject({
            Bucket: event.entity.s3Object.Bucket,
            Key: event.entity.s3Object.Key,
          })
          .promise();
      } catch (e: any) {
        try {
          const errorLogRepository = event.connection.getRepository(ErrorLog);
          errorLogRepository.save(ErrorLog.fromData({
            name: e.name,
            stack: e.stack,
            message: e.message,
          }));
        } catch (ex) {
          this.log.error(ex.toString());
        }
      }
    } else if (event.entity instanceof Product) {
      /**
       * @note hacky timeout to ensure cascade propagation
       */
      setTimeout(async() => {
        try {
          const uploadsRepository = event.connection.getRepository(Upload);

          const orphanUploads = await uploadsRepository
            .createQueryBuilder("upload")
            .where("(upload.relatedTo = 'product' AND (upload.product = :entityId OR upload.product IS NULL))")
            .setParameters({ entityId: event.entityId })
            .getMany();

          orphanUploads.forEach(upload => uploadsRepository.remove(upload));
        } catch (e: any) {
          try {
            const errorLogRepository = event.connection.getRepository(ErrorLog);
            errorLogRepository.save(ErrorLog.fromData({
              name: e.name,
              stack: e.stack,
              message: e.message,
            }));
          } catch (ex) {
            this.log.error(ex.toString());
          }
        }
      }, DELAY_BEFORE_CHECKING_FOR_ORPHANS_UPLOADS);
    }
  }
}
