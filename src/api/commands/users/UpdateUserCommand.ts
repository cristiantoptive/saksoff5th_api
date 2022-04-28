import { Roles, UserRoles } from "@app/api/types";
import { IsEnum, IsNotEmpty } from "class-validator";

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

  @IsNotEmpty({
    message: "User password is required",
  })
  public password: string;

  @IsNotEmpty({
    message: "User role is required",
  })
  @IsEnum(UserRoles, {
    message: "A valid user role is required",
  })
  public role: Roles;
}
