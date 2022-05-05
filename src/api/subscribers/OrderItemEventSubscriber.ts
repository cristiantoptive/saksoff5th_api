import { Service } from "typedi";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from "typeorm";

import { ErrorLog } from "@app/api/entities/ErrorLog";
import { Logger, LoggerInterface } from "@app/decorators/Logger";
import { Product } from "@app/api/entities/Product";
import { OrderItem } from "@app/api/entities/OrderItem";

@Service()
@EventSubscriber()
export class OrderItemEventSubscriber implements EntitySubscriberInterface<OrderItem> {
  @Logger(__filename) private log: LoggerInterface;

  async afterInsert(event: InsertEvent<OrderItem>): Promise<any> {
    try {
      if (event.entity) {
        const product = await event.entity.product;
        if (product) {
          const productRepository = event.connection.getRepository<Product>(Product);
          product.inventory = (product.inventory || 0) - (event.entity.quantity || 0);

          await productRepository.save(product);
        }
      }
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
  }

  async afterRemove(event: RemoveEvent<OrderItem>): Promise<any> {
    try {
      if (event.entity) {
        const product = await event.entity.product;
        if (product) {
          const productRepository = event.connection.getRepository<Product>(Product);
          product.inventory = (product.inventory || 0) + (event.entity.quantity || 0);

          await productRepository.save(product);
        }
      }
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
  }
}
