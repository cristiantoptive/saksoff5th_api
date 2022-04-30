import { IsNotEmpty, IsString, MaxLength, IsEnum, IsOptional } from "class-validator";
import { AddressTypes } from "@app/api/types";

export class AddressCommand {
  @IsEnum(AddressTypes, {
    message: "Address type isn't valid",
  })
  @IsNotEmpty({
    message: "Address type is required",
  })
  public type: string;

  @IsString()
  @IsNotEmpty({
    message: "First name name is required",
  })
  @MaxLength(255, {
    message: "First name can't have more than 255 characters",
  })
  public firstName: string;

  @IsString()
  @IsNotEmpty({
    message: "First name name is required",
  })
  @MaxLength(255, {
    message: "First name can't have more than 255 characters",
  })
  public lastName: string;

  @IsString()
  @IsNotEmpty({
    message: "First line is required",
  })
  @MaxLength(255, {
    message: "First line can't have more than 255 characters",
  })
  public line1: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, {
    message: "Second line can't have more than 255 characters",
  })
  public line2: string;

  @IsString()
  @IsNotEmpty({
    message: "City is required",
  })
  @MaxLength(255, {
    message: "City can't have more than 255 characters",
  })
  public city: string;

  @IsString()
  @IsNotEmpty({
    message: "State is required",
  })
  @MaxLength(255, {
    message: "State can't have more than 255 characters",
  })
  public state: string;

  @IsString()
  @IsNotEmpty({
    message: "Zipcode is required",
  })
  @MaxLength(255, {
    message: "Zipcode can't have more than 255 characters",
  })
  public zipcode: string;

  @IsString()
  @IsNotEmpty({
    message: "Country is required",
  })
  @MaxLength(255, {
    message: "Country can't have more than 255 characters",
  })
  public country: string;
}
