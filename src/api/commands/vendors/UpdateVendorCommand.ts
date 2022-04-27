import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateVendorCommand {
  @IsString()
  @IsNotEmpty({
    message: "Vendor name is required",
  })
  @MaxLength(200, {
    message: "Vendor name can't have more than 200 characters",
  })
  public name: string;
}
