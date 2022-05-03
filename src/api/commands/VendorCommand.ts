import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { AuthenticatedCommand } from "./AuthenticatedCommand";

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
