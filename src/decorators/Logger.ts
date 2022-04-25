import { Constructable, Container } from "typedi";
import { Logger as WinstonLogger } from "@app/lib/logger";

export function Logger(scope: string): any {
  return (object: any, propertyKey: string, index?: number): any => {
    const logger = new WinstonLogger(scope);
    const propertyName = propertyKey ? propertyKey.toString() : "";
    Container.registerHandler({ object: object as Constructable<any>, propertyName, index, value: () => logger });
  };
}

export { LoggerInterface } from "@app/lib/logger";
