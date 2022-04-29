import { IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ViewModel } from "./ViewModel";
import { Vendor } from "@app/api/entities/Vendor";

@JSONSchema({
  description: "Vendor view model",
})
export class VendorViewModel extends ViewModel {
  @IsString()
  public id: string;

  @IsString()
  public name: string;

  @IsString()
  public code: string;

  public construct(vendor: Vendor): Promise<VendorViewModel> {
    return super.mapObjectKeys({
      id: vendor.id,
      name: vendor.name,
      code: vendor.code,
    });
  }
}
