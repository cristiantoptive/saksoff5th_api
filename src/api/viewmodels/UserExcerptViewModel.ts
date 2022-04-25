import { IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ViewModel } from "./ViewModel";
import { User } from "@app/api/entities/User";

@JSONSchema({
  description: "Non-detailed user viewmodel",
})
export class UserExcerptViewModel extends ViewModel {
  @IsString()
  id: string;

  @IsString()
  fullName: string;

  construct(user: User): Promise<UserExcerptViewModel> {
    return super.mapObjectKeys({
      id: user.id,
      fullName: user.firstName + user.lastName,
    });
  }
}
