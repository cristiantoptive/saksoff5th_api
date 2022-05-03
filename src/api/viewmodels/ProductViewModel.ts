
import { IsString, IsNumber, IsBoolean, IsInstance, IsArray } from "class-validator";
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
  public id: string;

  @IsString()
  public SKU: string;

  @IsString()
  public title: string;

  @IsString()
  public description: string;

  @IsNumber()
  public price: number;

  @IsNumber()
  public inventory: number;

  @IsString()
  public deliveryTime: number;

  @IsBoolean()
  public isActive: boolean;

  @IsInstance(VendorViewModel)
  public vendor: VendorViewModel;

  @IsInstance(ProductCategoryViewModel)
  public category: ProductCategoryViewModel;

  @IsArray()
  @IsInstance(UploadViewModel, {
    each: true,
  })
  public images: UploadViewModel[];

  public construct(product: Product): Promise<ProductViewModel> {
    return super.mapObjectKeys({
      id: product.id,
      SKU: product.SKU,
      title: product.title,
      description: product.description,
      price: product.price,
      inventory: parseInt(product.inventory as unknown as string),
      deliveryTime: product.deliveryTime,
      isActive: !!product.isActive,
      vendor: ViewModel.createOne(VendorViewModel, product.vendor),
      category: ViewModel.createOne(ProductCategoryViewModel, product.category),
      images: ViewModel.createMany(UploadViewModel, product.images),
    });
  }
}
