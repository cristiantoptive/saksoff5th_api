import { Authorized, Body, JsonController, Delete, Get, Param, Put, Post, BadRequestError, CurrentUser } from "routing-controllers";
import { Inject, Service } from "typedi";

import { AddressService } from "@app/api/services";
import { ViewModel, AddressViewModel } from "@app/api/viewmodels";
import { User } from "@app/api/entities/User";
import { AddressCommand } from "@app/api/commands";

@Service()
@Authorized()
@JsonController("/addresses")
export class AddressController {
  @Inject() private addressesService: AddressService;

  @Get()
  public all(@CurrentUser() user: User): Promise<AddressViewModel[]> {
    return ViewModel.createMany(AddressViewModel, this.addressesService.all(user));
  }

  @Get("/:id")
  public one(@CurrentUser() user: User, @Param("id") id: string): Promise<AddressViewModel> {
    return ViewModel.createOne(AddressViewModel, this.addressesService.find(id, user));
  }

  @Post()
  public create(@CurrentUser() user: User, @Body() command: AddressCommand): Promise<AddressViewModel> {
    return ViewModel.createOne(AddressViewModel, this.addressesService.create(command, user));
  }

  @Put("/:id")
  public update(@CurrentUser() user: User, @Param("id") id: string, @Body() command: AddressCommand): Promise<AddressViewModel> {
    return ViewModel.createOne(AddressViewModel, this.addressesService.update(id, command, user));
  }

  @Delete("/:id")
  public async delete(@CurrentUser() user: User, @Param("id") id: string): Promise<any> {
    const result = await this.addressesService.delete(id, user);

    if (!result || !result.affected) {
      throw new BadRequestError("Can't delete target address");
    }

    return { success: true, status: "deleted" };
  }
}
