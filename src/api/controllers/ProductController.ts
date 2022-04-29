import { Authorized, Body, JsonController, Delete, Get, Param, Put, Post, BadRequestError, CurrentUser, QueryParam } from "routing-controllers";
import { Inject, Service } from "typedi";

import { ProductsService } from "@app/api/services";
import { ViewModel, ProductViewModel } from "@app/api/viewmodels";
import { User } from "@app/api/entities/User";
import { CreateProductCommand, UpdateProductCommand } from "@app/api/commands/products";
import { Roles } from "@app/api/types";

@Service()
@JsonController("/products")
export class ProductController {
  @Inject() private productsService: ProductsService;

  @Get()
  public async all(@CurrentUser({ required: false }) user: User, @QueryParam("onlyMine") onlyMine?: boolean): Promise<ProductViewModel[]> {
    return ViewModel.createMany(ProductViewModel, this.productsService.all(user, onlyMine));
  }

  @Get("/:id")
  public async one(@Param("id") id: string): Promise<ProductViewModel> {
    return ViewModel.createOne(ProductViewModel, this.productsService.find(id));
  }

  @Post()
  @Authorized([Roles.Merchandiser])
  public create(@CurrentUser() user: User, @Body() command: CreateProductCommand): Promise<ProductViewModel> {
    return ViewModel.createOne(ProductViewModel, this.productsService.create(command, user));
  }

  @Put("/:id")
  @Authorized([Roles.Merchandiser])
  public update(@CurrentUser() user: User, @Param("id") id: string, @Body() command: UpdateProductCommand): Promise<ProductViewModel> {
    return ViewModel.createOne(ProductViewModel, this.productsService.update(id, command, user));
  }

  @Delete("/:id")
  @Authorized([Roles.Merchandiser])
  public async delete(@CurrentUser() user: User, @Param("id") id: string): Promise<any> {
    const result = await this.productsService.delete(id, user);

    if (!result) {
      throw new BadRequestError("Can't delete target product");
    }

    return { success: true, status: "deleted" };
  }
}
