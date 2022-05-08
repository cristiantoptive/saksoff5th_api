import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { AuthenticatedCommand } from "./AuthenticatedCommand";

@JSONSchema({
  description: "This model is used to create or update vendors",
})
export class VendorCommand extends AuthenticatedCommand {
  @IsString()
  @IsNotEmpty({
    message: "Vendor name is required",
  })
  @MaxLength(200, {
    message: "Vendor name can't have more than 200 characters",
  })
  public name: string;
}
