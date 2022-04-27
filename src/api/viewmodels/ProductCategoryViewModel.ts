import { IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ViewModel } from "./ViewModel";
import { ProductCategory } from "@app/api/entities/ProductCategory";

@JSONSchema({
  description: "Product category view model",
})
export class ProductCategoryViewModel extends ViewModel {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  code: string;

  construct(category: ProductCategory): Promise<ProductCategoryViewModel> {
    return super.mapObjectKeys({
      id: category.id,
      name: category.name,
      code: category.code,
    });
  }
}
