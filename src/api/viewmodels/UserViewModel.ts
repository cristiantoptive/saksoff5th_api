import { IsString, IsEmail, IsEnum } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ViewModel } from "./ViewModel";
import { User } from "@app/api/entities/User";
import { UserRoles, Roles } from "@app/api/types";

@JSONSchema({
  description: "Detailed user viewmodel",
})
export class UserViewModel extends ViewModel {
  @IsString()
  public id: string;

  @IsString()
  @IsEmail()
  public email: string;

  @IsEnum(UserRoles)
  public role: Roles;

  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  public construct(user: User): Promise<UserViewModel> {
    return super.mapObjectKeys({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }
}
