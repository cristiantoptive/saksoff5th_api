import { IsOptional, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ViewModel } from "./ViewModel";
import { Address } from "@app/api/entities/Address";

@JSONSchema({
  description: "Address view model",
})
export class AddressViewModel extends ViewModel {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  line1: string;

  @IsString()
  @IsOptional()
  line2: string;

  @IsString()
  state: string;

  @IsString()
  zipcode: string;

  @IsString()
  country: string;

  construct(address: Address): Promise<AddressViewModel> {
    return super.mapObjectKeys({
      id: address.id,
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      line1: address.line1,
      line2: address.line2,
      state: address.state,
      zipcode: address.zipcode,
      country: address.country,
    });
  }
}
