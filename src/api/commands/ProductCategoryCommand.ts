import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { AuthenticatedCommand } from "./AuthenticatedCommand";

@JSONSchema({
  description: "This model is used to create or update product categories",
})
export class ProductCategoryCommand extends AuthenticatedCommand {
  @IsString()
  @IsNotEmpty({
    message: "Category name is required",
  })
  @MaxLength(200, {
    message: "Category name can't have more than 200 characters",
  })
  public name: string;
}
