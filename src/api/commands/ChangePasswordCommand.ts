import { IsNotEmpty } from "class-validator";

export class ChangePasswordCommand {
  @IsNotEmpty({
    message: "Old password is required",
  })
  public oldPassword: string;

  @IsNotEmpty({
    message: "New password is required",
  })
  public newPassword: string;
}
