import { Authorized, Body, JsonController, Delete, Get, Param, Put, Post, BadRequestError } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Inject, Service } from "typedi";

import { ProductCategoryService } from "@app/api/services";
import { ViewModel, ProductCategoryViewModel, DeletedViewModel } from "@app/api/viewmodels";
import { ProductCategoryCommand } from "@app/api/commands";
import { Roles } from "@app/api/types";

@Service()
@JsonController("/categories")
export class ProductCategoryController {
  @Inject() private categoriesService: ProductCategoryService;

  @Get()
  @OpenAPI({ summary: "List all product categories" })
  @ResponseSchema(ProductCategoryViewModel, { isArray: true })
  public all(): Promise<ProductCategoryViewModel[]> {
    return ViewModel.createMany(ProductCategoryViewModel, this.categoriesService.all());
  }

  @Get("/:id")
  @OpenAPI({ summary: "Detailed view of a single product categories" })
  @ResponseSchema(ProductCategoryViewModel)
  public one(@Param("id") id: string): Promise<ProductCategoryViewModel> {
    return ViewModel.createOne(ProductCategoryViewModel, this.categoriesService.find(id));
  }

  @Post()
  @Authorized([Roles.Admin])
  @OpenAPI({ summary: "Create new product category (only admin)", security: [{ bearerAuth: [] }] })
  @ResponseSchema(ProductCategoryViewModel)
  public create(@Body() command: ProductCategoryCommand): Promise<ProductCategoryViewModel> {
    return ViewModel.createOne(ProductCategoryViewModel, this.categoriesService.create(command));
  }

  @Put("/:id")
  @Authorized([Roles.Admin])
  @OpenAPI({ summary: "Update one product category by id (only admin)", security: [{ bearerAuth: [] }] })
  @ResponseSchema(ProductCategoryViewModel)
  public update(@Param("id") id: string, @Body() command: ProductCategoryCommand): Promise<ProductCategoryViewModel> {
    return ViewModel.createOne(ProductCategoryViewModel, this.categoriesService.update(id, command));
  }

  @Delete("/:id")
  @Authorized([Roles.Admin])
  @OpenAPI({ summary: "Remove one product category by id (only admin)", security: [{ bearerAuth: [] }] })
  @ResponseSchema(DeletedViewModel)
  public async delete(@Param("id") id: string): Promise<DeletedViewModel> {
    const result = await this.categoriesService.delete(id);

    if (!result || !result.affected) {
      throw new BadRequestError("Can't delete target product category");
    }

    return ViewModel.createOne(DeletedViewModel, { success: true, status: "deleted" });
  }
}
