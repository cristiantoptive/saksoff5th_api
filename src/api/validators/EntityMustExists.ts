import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isEmpty,
  isUUID,
  ValidationArguments,
} from "class-validator";
import { Service } from "typedi";
import { FindConditions, getRepository } from "typeorm";
import { AuthenticatedCommand } from "@app/api/commands/AuthenticatedCommand";

@Service()
@ValidatorConstraint({
  async: true,
  name: "entityMustExists",
})
export class EntityMustExistsConstraint implements ValidatorConstraintInterface {
  async validate(id: string, opts: ValidationArguments): Promise<boolean> {
    if (isEmpty(id) || !isUUID(id, 4)) {
      return false;
    }

    const [entityClazz, { mustMatch = { } }] = opts.constraints;
    const userKey = Object.keys(mustMatch).find(key => mustMatch[key] === "@currentUser");

    if (userKey) {
      mustMatch[userKey] = (opts.object as AuthenticatedCommand).currentUser;
    }

    const entity = await getRepository(entityClazz).findOne({
      where: {
        id,
        ...mustMatch,
      },
    });

    if (entity) {
      opts.object[opts.property] = entity;
    }

    return !!entity;
  }

  defaultMessage(): string {
    return "target entity must exists";
  }
}

export interface ExtendedValidationOptions<T> extends ValidationOptions {
  mustMatch?: FindConditions<T>;
}

export function EntityMustExists<T>(entityClazz: new () => T, options?: ExtendedValidationOptions<T>): any {
  return function(object: unknown, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [entityClazz, options],
      validator: EntityMustExistsConstraint,
    });
  };
}

