import { IsNotEmpty } from "class-validator";

export class UpdateUserCommand {
  @IsNotEmpty({
    message: "User email address is required",
  })
  public email: string;

  @IsNotEmpty({
    message: "User first name is required",
  })
  public firstName: string;

  @IsNotEmpty({
    message: "User last name is required",
  })
  public lastName: string;
}
