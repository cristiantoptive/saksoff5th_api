import { IsEnum, IsNotEmpty, MaxLength } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { Roles, UserRoles } from "@app/api/types";
import { AuthenticatedCommand } from "./AuthenticatedCommand";

@JSONSchema({
  description: "This model is used to create or update users",
})
export class UserCommand extends AuthenticatedCommand {
  @IsNotEmpty({
    message: "User email address is required",
  })
  @MaxLength(255, {
    message: "Email can't have more than 255 characters",
  })
  public email: string;

  @IsNotEmpty({
    message: "User first name is required",
  })
  @MaxLength(255, {
    message: "First name can't have more than 255 characters",
  })
  public firstName: string;

  @IsNotEmpty({
    message: "User last name is required",
  })
  @MaxLength(255, {
    message: "Last name can't have more than 255 characters",
  })
  public lastName: string;

  @IsNotEmpty({
    message: "User password is required",
  })
  @MaxLength(50, {
    message: "Password can't have more than 50 characters",
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
