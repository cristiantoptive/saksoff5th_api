/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Card } from "@app/api/entities/Card";
import { IProcessor } from "typeorm-fixtures-cli";

export default class CardProcessor implements IProcessor<Card> {
  preProcess(name: string, object: any): any {
    return {
      ...object,
      number: object.number.replace(/-/g, "").trim(),
      expiresOn: new Date(object.expiresOn),
      name: `${object.user.lastName} ${object.user.firstName}`,
      user: Promise.resolve(object.user),
    };
  }
}
