import { IsEmail, IsNotEmpty } from "class-validator";

export class SignupCommand {
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

  @IsNotEmpty({
    message: "First name is required",
  })
  public firstName: string;

  @IsNotEmpty({
    message: "Last name is required",
  })
  public lastName: string;
}
