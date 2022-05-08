import { IsNotEmpty, IsEmail, MaxLength } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";

@JSONSchema({
  description: "This model is used to authenticate a user in the system",
})
export class SigninCommand {
  @IsEmail({}, {
    message: "Email address is not valid",
  })
  @IsNotEmpty({
    message: "Email address is required",
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
}
