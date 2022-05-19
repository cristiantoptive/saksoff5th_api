import { Authorized, Body, JsonController, Delete, Get, Param, Put, Post, BadRequestError, CurrentUser, QueryParam } from "routing-controllers";
import { Inject, Service } from "typedi";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";

import { ProductsService } from "@app/api/services";
import { ViewModel, ProductViewModel, DeletedViewModel } from "@app/api/viewmodels";
import { User } from "@app/api/entities/User";
import { ProductCommand } from "@app/api/commands";
import { Roles } from "@app/api/types";

@Service()
@JsonController("/products")
export class ProductController {
  @Inject() private productsService: ProductsService;

  @Get()
  @Authorized([Roles.Guest, Roles.Customer, Roles.Merchandiser])
  @OpenAPI({ summary: "List all products. Use query param 'onlyMine' to list all the products created by the authenticated user" })
  @ResponseSchema(ProductViewModel, { isArray: true })
  public all(
    @CurrentUser({ required: false }) user?: User,
    @QueryParam("onlyMine", { required: false }) onlyMine?: boolean,
    @QueryParam("search", { required: false }) search?: string,
    @QueryParam("categories", { required: false }) categories?: string,
    @QueryParam("vendors", { required: false }) vendors?: string,
  ): Promise<ProductViewModel[]> {
    return ViewModel.createMany(ProductViewModel, this.productsService.all(user, onlyMine, search, categories, vendors));
  }

  @Get("/:id")
  @OpenAPI({ summary: "Detailed view of a single product" })
  @ResponseSchema(ProductViewModel)
  public one(@Param("id") id: string): Promise<ProductViewModel> {
    return ViewModel.createOne(ProductViewModel, this.productsService.find(id));
  }

  @Post()
  @Authorized([Roles.Merchandiser])
  @OpenAPI({ summary: "Create new product (only merchandiser)", security: [{ bearerAuth: [] }] })
  @ResponseSchema(ProductViewModel)
  public create(@CurrentUser() user: User, @Body() command: ProductCommand): Promise<ProductViewModel> {
    return ViewModel.createOne(ProductViewModel, this.productsService.create(command, user));
  }

  @Put("/:id")
  @Authorized([Roles.Merchandiser])
  @OpenAPI({ summary: "Update one product by id (only merchandiser)", security: [{ bearerAuth: [] }] })
  @ResponseSchema(ProductViewModel)
  public update(@CurrentUser() user: User, @Param("id") id: string, @Body() command: ProductCommand): Promise<ProductViewModel> {
    return ViewModel.createOne(ProductViewModel, this.productsService.update(id, command, user));
  }

  @Delete("/:id")
  @Authorized([Roles.Merchandiser])
  @OpenAPI({ summary: "Remove one product by id (only merchandiser)", security: [{ bearerAuth: [] }] })
  @ResponseSchema(DeletedViewModel)
  public async delete(@CurrentUser() user: User, @Param("id") id: string): Promise<DeletedViewModel> {
    const result = await this.productsService.delete(id, user);

    if (!result) {
      throw new BadRequestError("Can't delete target product");
    }

    return ViewModel.createOne(DeletedViewModel, { success: true, status: "deleted" });
  }
}
