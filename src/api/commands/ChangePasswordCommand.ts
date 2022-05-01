import { IsNotEmpty } from "class-validator";
import { IsCurrentUserPassword } from "@app/api/validators";
import { AuthenticatedCommand } from "./AuthenticatedCommand";

export class ChangePasswordCommand extends AuthenticatedCommand {
  @IsNotEmpty({
    message: "Old password is required",
  })
  @IsCurrentUserPassword({
    message: "The old password does not match the user password",
  })
  public oldPassword: string;

  @IsNotEmpty({
    message: "New password is required",
  })
  public newPassword: string;
}
