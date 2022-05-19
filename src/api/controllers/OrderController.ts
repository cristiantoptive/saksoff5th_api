import { Authorized, Body, JsonController, Delete, Get, Param, Put, Post, BadRequestError, CurrentUser } from "routing-controllers";
import { Inject, Service } from "typedi";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";

import { OrderService } from "@app/api/services";
import { ViewModel, OrderViewModel, DeletedViewModel } from "@app/api/viewmodels";
import { User } from "@app/api/entities/User";
import { OrderCommand } from "@app/api/commands";

@Service()
@Authorized()
@JsonController("/orders")
export class OrderController {
  @Inject() private ordersService: OrderService;

  @Get()
  @OpenAPI({ summary: "Retrieve all orders from the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(OrderViewModel, { isArray: true })
  public all(@CurrentUser() user: User): Promise<OrderViewModel[]> {
    return ViewModel.createMany(OrderViewModel, this.ordersService.all(user));
  }

  @Get("/:id")
  @OpenAPI({ summary: "Retrieve one order by id from the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(OrderViewModel)
  public one(@CurrentUser() user: User, @Param("id") id: string): Promise<OrderViewModel> {
    return ViewModel.createOne(OrderViewModel, this.ordersService.find(id, user));
  }

  @Post()
  @OpenAPI({ summary: "Create a new order for the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(OrderViewModel)
  public create(@CurrentUser() user: User, @Body() command: OrderCommand): Promise<OrderViewModel> {
    return ViewModel.createOne(OrderViewModel, this.ordersService.create(command, user));
  }

  @Put("/:id")
  @OpenAPI({ summary: "Update existing order by id for the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(OrderViewModel)
  public update(@CurrentUser() user: User, @Param("id") id: string, @Body() command: OrderCommand): Promise<OrderViewModel> {
    return ViewModel.createOne(OrderViewModel, this.ordersService.update(id, command, user));
  }

  @Delete("/:id")
  @OpenAPI({ summary: "Delete existing order by id from the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(DeletedViewModel)
  public async delete(@CurrentUser() user: User, @Param("id") id: string): Promise<DeletedViewModel> {
    const result = await this.ordersService.delete(id, user);

    if (!result || !result.affected) {
      throw new BadRequestError("Can't delete target order");
    }

    return ViewModel.createOne(DeletedViewModel, { success: true, status: "deleted" });
  }
}
