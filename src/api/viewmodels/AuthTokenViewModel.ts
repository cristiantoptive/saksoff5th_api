import { IsString, IsInstance } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { User } from "@app/api/entities/User";
import { UserViewModel } from "./UserViewModel";
import { ViewModel } from "./ViewModel";

@JSONSchema({
  description: "User authentication data viewmodel",
})
export class AuthTokenViewModel extends ViewModel {
  @IsString()
  public token: string;

  @IsInstance(UserViewModel)
  public user: UserViewModel;

  public construct(values: { token: string, user: User }): Promise<AuthTokenViewModel> {
    return super.mapObjectKeys({
      token: values.token,
      user: ViewModel.createOne(UserViewModel, values.user),
    });
  }
}
