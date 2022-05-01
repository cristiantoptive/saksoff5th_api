import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isEmpty,
  ValidationArguments,
} from "class-validator";
import { Service } from "typedi";
import { User } from "@app/api/entities/User";
import { AuthenticatedCommand } from "@app/api/commands/AuthenticatedCommand";

@Service()
@ValidatorConstraint({
  async: true,
  name: "isCurrentUserPassword",
})
export class IsCurrentUserPasswordConstraint implements ValidatorConstraintInterface {
  async validate(password: string, opts: ValidationArguments): Promise<boolean> {
    if (isEmpty(password)) {
      return false;
    }

    const user = (opts.object as AuthenticatedCommand).currentUser;
    const passwordMatches = await User.comparePassword(user, password);

    return passwordMatches;
  }

  defaultMessage(): string {
    return "value must match current (authenticated) user password";
  }
}

export function IsCurrentUserPassword(options?: ValidationOptions) {
  return function(object: unknown, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsCurrentUserPasswordConstraint,
    });
  };
}

