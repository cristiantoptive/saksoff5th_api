import { IsEnum, IsOptional, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ViewModel } from "./ViewModel";
import { Address } from "@app/api/entities/Address";
import { AddressTypes } from "@app/api/types";

@JSONSchema({
  description: "Address view model",
})
export class AddressViewModel extends ViewModel {
  @IsString()
  public id: string;

  @IsEnum(AddressTypes)
  public type: string;

  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsString()
  public line1: string;

  @IsString()
  @IsOptional()
  public line2: string;

  @IsString()
  public state: string;

  @IsString()
  public zipcode: string;

  @IsString()
  public country: string;

  public construct(address: Address): Promise<AddressViewModel> {
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
