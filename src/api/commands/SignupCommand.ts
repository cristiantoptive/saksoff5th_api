import { IsEmail, IsNotEmpty, MaxLength } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { IsEmailIsAlreadyInUse } from "@app/api/validators";

@JSONSchema({
  description: "This model is used to register a new 'customer' user",
})
export class SignupCommand {
  @IsEmail({}, {
    message: "Email address is not valid",
  })
  @IsNotEmpty({
    message: "Email address is required",
  })
  @IsEmailIsAlreadyInUse({
    message: "Email address is alredy in use by another user",
  })
  @MaxLength(255, {
    message: "Email can't have more than 255 characters",
  })
  public email: string;

  @IsNotEmpty({
    message: "Password is required",
  })
  @MaxLength(50, {
    message: "Password can't have more than 50 characters",
  })
  public password: string;

  @IsNotEmpty({
    message: "First name is required",
  })
  @MaxLength(255, {
    message: "First name can't have more than 255 characters",
  })
  public firstName: string;

  @IsNotEmpty({
    message: "Last name is required",
  })
  @MaxLength(255, {
    message: "Last name can't have more than 255 characters",
  })
  public lastName: string;
}
