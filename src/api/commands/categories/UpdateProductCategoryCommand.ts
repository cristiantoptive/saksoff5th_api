import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateProductCategoryCommand {
  @IsString()
  @IsNotEmpty({
    message: "Category name is required",
  })
  @MaxLength(200, {
    message: "Category name can't have more than 200 characters",
  })
  public name: string;
}
