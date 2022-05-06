import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  validate,
} from "class-validator";
import { plainToClass } from "class-transformer";
import { Service } from "typedi";

@Service()
@ValidatorConstraint({
  async: true,
  name: "validateNested",
})
export class ValidateNestedConstraint implements ValidatorConstraintInterface {
  private validationErrors: { [key: number]: any[] } = { };

  async validate(value: unknown, opts: ValidationArguments): Promise<boolean> {
    if (!value) {
      return true;
    }

    const [entityClazz] = opts.constraints;

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        value[i] = plainToClass(entityClazz, value[i]);
        this.validationErrors[i] = await validate(value[i]);
      }
    } else {
      opts.object[opts.property] = plainToClass(entityClazz, value);
      this.validationErrors[0] = await validate(opts.object[opts.property]);
    }

    const thereAreErrors = Object.values(this.validationErrors).some(error => error && error.length);
    return !thereAreErrors;
  }

  defaultMessage(args: unknown): string {
    const { value, property } = args as any;

    if (!value) {
      return "validate nested empty value";
    }

    return JSON.stringify(Object.keys(this.validationErrors)
      .reduce((accum: any, key: any) => {
        if (this.validationErrors[key] && this.validationErrors[key].length) {
          return {
            ...accum,
            [`${property}${key}`]: ((this.validationErrors[key].reduce((obj, validation) => {
              return {
                ...obj,
                ...({ [validation.property]: validation.constraints }),
              };
            }, { }))),
          };
        }

        return accum;
      }, { }), null, 2);
  }
}

export function ValidateNested<T>(entityClazz: new () => T, options?: ValidationOptions): any {
  return function(object: unknown, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [entityClazz, options],
      validator: ValidateNestedConstraint,
    });
  };
}
