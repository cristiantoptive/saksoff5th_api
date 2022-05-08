import { IsNotEmpty, MaxLength } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { IsCurrentUserPassword } from "@app/api/validators";
import { AuthenticatedCommand } from "./AuthenticatedCommand";

@JSONSchema({
  description: "This model is used to change authenticated user password",
})
export class ChangePasswordCommand extends AuthenticatedCommand {
  @IsNotEmpty({
    message: "Old password is required",
  })
  @IsCurrentUserPassword({
    message: "The old password does not match the user password",
  })
  @MaxLength(50, {
    message: "Password can't have more than 50 characters",
  })
  public oldPassword: string;

  @IsNotEmpty({
    message: "New password is required",
  })
  @MaxLength(50, {
    message: "New password can't have more than 50 charcters",
  })
  public newPassword: string;
}
