import { IsNotEmpty, IsNumber, Min, IsUUID, IsOptional, IsString, MaxLength, IsBoolean } from "class-validator";

export class CreateProductCommand {
  @IsString()
  @IsNotEmpty({
    message: "Product SKU is required",
  })
  @MaxLength(255, {
    message: "Product SKU can't have more than 255 characters",
  })
  public SKU: string;

  @IsString()
  @IsNotEmpty({
    message: "Product title is required",
  })
  @MaxLength(255, {
    message: "Product title can't have more than 255 characters",
  })
  public title: string;

  @IsString()
  @IsOptional()
  public description: string;

  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 2,
  }, {
    message: "Product price must be a valid number",
  })
  @Min(0.01, {
    message: "Product price must be a positive number greater than 0.01",
  })
  public price: number;

  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  }, {
    message: "Product inventory must be a valid integer number",
  })
  @Min(1, {
    message: "Product inventory must be a positive number greater than 1",
  })
  public inventory: number;

  @IsString()
  @IsNotEmpty({
    message: "Product delivery time is required",
  })
  @MaxLength(255, {
    message: "Product delivery time can't have more than 255 characters",
  })
  public deliveryTime: string;

  @IsBoolean({
    message: "Product active status is required",
  })
  public isActive: boolean;

  @IsUUID(4, {
    message: "Product Vendor must be a valid vendor uuid",
  })
  public vendor: string;

  @IsUUID(4, {
    message: "Product category must be a valid category uuid",
  })
  public category: string;
}
