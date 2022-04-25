import { IsString, IsEmail } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ViewModel } from "./ViewModel";
import { User } from "@app/api/entities/User";

@JSONSchema({
  description: "Detailed user viewmodel",
})
export class UserViewModel extends ViewModel {
  @IsString()
  id: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  construct(user: User): Promise<UserViewModel> {
    return super.mapObjectKeys({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }
}
