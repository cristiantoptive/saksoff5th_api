import { IsString, IsEmail } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ViewModel } from "./ViewModel";
import { User } from "@app/api/entities/User";

@JSONSchema({
  description: "Detailed user viewmodel",
})
export class UserViewModel extends ViewModel {
  @IsString()
  public id: string;

  @IsString()
  @IsEmail()
  public email: string;

  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  public construct(user: User): Promise<UserViewModel> {
    return super.mapObjectKeys({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }
}
