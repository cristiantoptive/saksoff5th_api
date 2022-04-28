
import { IsString, IsNumber, IsBoolean, IsInstance } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ViewModel } from "./ViewModel";
import { Product } from "@app/api/entities/Product";
import { VendorViewModel } from "./VendorViewModel";
import { ProductCategoryViewModel } from "./ProductCategoryViewModel";
import { UploadViewModel } from "./UploadViewModel";

@JSONSchema({
  description: "Product view model",
})
export class ProductViewModel extends ViewModel {
  @IsString()
  id: string;

  @IsString()
  SKU: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  inventory: number;

  @IsString()
  deliveryTime: number;

  @IsBoolean()
  isActive: boolean;

  @IsInstance(VendorViewModel)
  vendor: VendorViewModel;

  @IsInstance(ProductCategoryViewModel)
  category: ProductCategoryViewModel;

  @IsInstance(UploadViewModel, {
    each: true,
  })
  images: UploadViewModel[];

  construct(product: Product): Promise<ProductViewModel> {
    return super.mapObjectKeys({
      id: product.id,
      SKU: product.SKU,
      title: product.title,
      description: product.description,
      price: product.price,
      inventory: product.inventory,
      deliveryTime: product.deliveryTime,
      isActive: product.isActive,
      vendor: ViewModel.createOne(VendorViewModel, product.vendor),
      category: ViewModel.createOne(ProductCategoryViewModel, product.category),
      images: ViewModel.createMany(UploadViewModel, product.images),
    });
  }
}
