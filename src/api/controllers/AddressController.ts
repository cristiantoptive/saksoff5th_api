import { Authorized, Body, JsonController, Delete, Get, Param, Put, Post, BadRequestError, CurrentUser } from "routing-controllers";
import { Inject, Service } from "typedi";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";

import { AddressService } from "@app/api/services";
import { ViewModel, AddressViewModel, DeletedViewModel } from "@app/api/viewmodels";
import { User } from "@app/api/entities/User";
import { AddressCommand } from "@app/api/commands";

@Service()
@Authorized()
@JsonController("/addresses")
export class AddressController {
  @Inject() private addressesService: AddressService;

  @Get()
  @OpenAPI({ summary: "Retrieve all addresses from the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(AddressViewModel, { isArray: true })
  public all(@CurrentUser() user: User): Promise<AddressViewModel[]> {
    return ViewModel.createMany(AddressViewModel, this.addressesService.all(user));
  }

  @Get("/:id")
  @OpenAPI({ summary: "Retrieve one address by id from the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(AddressViewModel)
  public one(@CurrentUser() user: User, @Param("id") id: string): Promise<AddressViewModel> {
    return ViewModel.createOne(AddressViewModel, this.addressesService.find(id, user));
  }

  @Post()
  @OpenAPI({ summary: "Create a new address for the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(AddressViewModel)
  public create(@CurrentUser() user: User, @Body() command: AddressCommand): Promise<AddressViewModel> {
    return ViewModel.createOne(AddressViewModel, this.addressesService.create(command, user));
  }

  @Put("/:id")
  @OpenAPI({ summary: "Update existing address by id for the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(AddressViewModel)
  public update(@CurrentUser() user: User, @Param("id") id: string, @Body() command: AddressCommand): Promise<AddressViewModel> {
    return ViewModel.createOne(AddressViewModel, this.addressesService.update(id, command, user));
  }

  @Delete("/:id")
  @OpenAPI({ summary: "Delete existing address by id from the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(DeletedViewModel)
  public async delete(@CurrentUser() user: User, @Param("id") id: string): Promise<DeletedViewModel> {
    const result = await this.addressesService.delete(id, user);

    if (!result || !result.affected) {
      throw new BadRequestError("Can't delete target address");
    }

    return ViewModel.createOne(DeletedViewModel, { success: true, status: "deleted" });
  }
}
