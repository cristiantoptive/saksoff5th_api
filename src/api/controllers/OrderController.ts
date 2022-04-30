import { Authorized, Body, JsonController, Delete, Get, Param, Put, Post, BadRequestError, CurrentUser } from "routing-controllers";
import { Inject, Service } from "typedi";

import { OrderService } from "@app/api/services";
import { ViewModel, OrderViewModel } from "@app/api/viewmodels";
import { User } from "@app/api/entities/User";
import { OrderCommand } from "@app/api/commands";

@Service()
@Authorized()
@JsonController("/orders")
export class OrderController {
  @Inject() private ordersService: OrderService;

  @Get()
  public async all(@CurrentUser() user: User): Promise<OrderViewModel[]> {
    return ViewModel.createMany(OrderViewModel, this.ordersService.all(user));
  }

  @Get("/:id")
  public async one(@CurrentUser() user: User, @Param("id") id: string): Promise<OrderViewModel> {
    return ViewModel.createOne(OrderViewModel, this.ordersService.find(id, user));
  }

  @Post()
  public create(@CurrentUser() user: User, @Body() command: OrderCommand): Promise<OrderViewModel> {
    return ViewModel.createOne(OrderViewModel, this.ordersService.create(command, user));
  }

  @Put("/:id")
  public update(@CurrentUser() user: User, @Param("id") id: string, @Body() command: OrderCommand): Promise<OrderViewModel> {
    return ViewModel.createOne(OrderViewModel, this.ordersService.update(id, command, user));
  }

  @Delete("/:id")
  public async delete(@CurrentUser() user: User, @Param("id") id: string): Promise<any> {
    const result = await this.ordersService.delete(id, user);

    if (!result) {
      throw new BadRequestError("Can't delete target order");
    }

    return { success: true, status: "deleted" };
  }
}
