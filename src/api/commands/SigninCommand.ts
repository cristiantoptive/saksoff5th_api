import { IsNotEmpty, IsEmail } from "class-validator";

export class SigninCommand {
  @IsEmail({}, {
    message: "Email address is not valid",
  })
  @IsNotEmpty({
    message: "Email address is required",
  })
  public email: string;

  @IsNotEmpty({
    message: "Password is required",
  })
  public password: string;
}
