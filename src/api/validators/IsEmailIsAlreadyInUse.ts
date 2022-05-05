import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isEmail,
} from "class-validator";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { UserRepository } from "@app/api/repositories";

@Service()
@ValidatorConstraint({
  async: true,
  name: "emailIsAlreadyInUse",
})
export class IsEmailIsAlreadyInUseConstraint implements ValidatorConstraintInterface {
  @InjectRepository() private userRepository: UserRepository;

  async validate(email: string): Promise<boolean> {
    if (!isEmail(email)) {
      return true;
    }

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    return !user;
  }

  defaultMessage(): string {
    return "email address is already in use by another user";
  }
}

export function IsEmailIsAlreadyInUse(options?: ValidationOptions) {
  return function(object: unknown, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsEmailIsAlreadyInUseConstraint,
    });
  };
}

