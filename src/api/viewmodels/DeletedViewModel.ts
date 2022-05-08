import { IsBoolean, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ViewModel } from "./ViewModel";

@JSONSchema({
  description: "Result view model for delete entity request",
})
export class DeletedViewModel extends ViewModel {
  @IsBoolean()
  public success: boolean;

  @IsString()
  public status: string;

  public construct(res: { success: boolean; status: string; }): Promise<DeletedViewModel> {
    return super.mapObjectKeys({
      success: res.success,
      status: res.status,
    });
  }
}
