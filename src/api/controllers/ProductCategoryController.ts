import { Authorized, Body, JsonController, Delete, Get, Param, Put, Post, BadRequestError } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Inject, Service } from "typedi";

import { ProductCategoryService } from "@app/api/services";
import { ViewModel, ProductCategoryViewModel } from "@app/api/viewmodels";
import { ProductCategoryCommand } from "@app/api/commands";
import { Roles } from "@app/api/types";

@Service()
@JsonController("/categories")
export class ProductCategoryController {
  @Inject() private categoriesService: ProductCategoryService;

  @Get()
  @OpenAPI({ summary: "List all product categories" })
  @ResponseSchema(ProductCategoryViewModel, {
    isArray: true,
    description: "A array list of all the product categories availables",
  })
  public all(): Promise<ProductCategoryViewModel[]> {
    return ViewModel.createMany(ProductCategoryViewModel, this.categoriesService.all());
  }

  @Get("/:id")
  @OpenAPI({ summary: "Detailed view of a single product categories" })
  @ResponseSchema(ProductCategoryViewModel, {
    description: "A view of the target product category",
  })
  public one(@Param("id") id: string): Promise<ProductCategoryViewModel> {
    return ViewModel.createOne(ProductCategoryViewModel, this.categoriesService.find(id));
  }

  @Post()
  @Authorized([Roles.Admin])
  @OpenAPI({
    summary: "Add one product category",
    security: [{ bearerAuth: [] }],
  })
  @ResponseSchema(ProductCategoryViewModel, {
    description: "A view of the freshly created product category",
  })
  public create(@Body() command: ProductCategoryCommand): Promise<ProductCategoryViewModel> {
    return ViewModel.createOne(ProductCategoryViewModel, this.categoriesService.create(command));
  }

  @Put("/:id")
  @Authorized([Roles.Admin])
  @OpenAPI({
    summary: "Update one product category by id",
    security: [{ bearerAuth: [] }],
  })
  @ResponseSchema(ProductCategoryViewModel, {
    description: "A view of the updated product category",
  })
  public update(@Param("id") id: string, @Body() command: ProductCategoryCommand): Promise<ProductCategoryViewModel> {
    return ViewModel.createOne(ProductCategoryViewModel, this.categoriesService.update(id, command));
  }

  @Delete("/:id")
  @Authorized([Roles.Admin])
  @OpenAPI({
    summary: "Remove one product category by id",
    security: [{ bearerAuth: [] }],
  })
  public async delete(@Param("id") id: string): Promise<any> {
    const result = await this.categoriesService.delete(id);

    if (!result) {
      throw new BadRequestError("Can't delete target product category");
    }

    return { success: true, status: "deleted" };
  }
}
