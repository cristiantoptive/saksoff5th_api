import { Authorized, Body, JsonController, Delete, Get, Param, Put, Post, BadRequestError, CurrentUser, QueryParam } from "routing-controllers";
import { Inject, Service } from "typedi";

import { VendorService } from "@app/api/services";
import { ViewModel, VendorViewModel } from "@app/api/viewmodels";
import { Roles } from "@app/api/types";
import { User } from "@app/api/entities/User";
import { VendorCommand } from "@app/api/commands";

@Service()
@JsonController("/vendors")
export class VendorController {
  @Inject() private vendorsService: VendorService;

  @Get()
  public all(@CurrentUser({ required: false }) user?: User, @QueryParam("onlyMine") onlyMine?: boolean): Promise<VendorViewModel[]> {
    return ViewModel.createMany(VendorViewModel, this.vendorsService.all(user, onlyMine));
  }

  @Get("/:id")
  public one(@Param("id") id: string): Promise<VendorViewModel> {
    return ViewModel.createOne(VendorViewModel, this.vendorsService.find(id));
  }

  @Post()
  @Authorized([Roles.Merchandiser])
  public create(@CurrentUser() user: User, @Body() command: VendorCommand): Promise<VendorViewModel> {
    return ViewModel.createOne(VendorViewModel, this.vendorsService.create(command, user));
  }

  @Put("/:id")
  @Authorized([Roles.Merchandiser])
  public update(@CurrentUser() user: User, @Param("id") id: string, @Body() command: VendorCommand): Promise<VendorViewModel> {
    return ViewModel.createOne(VendorViewModel, this.vendorsService.update(id, command, user));
  }

  @Delete("/:id")
  @Authorized([Roles.Merchandiser])
  public async delete(@CurrentUser() user: User, @Param("id") id: string): Promise<any> {
    const result = await this.vendorsService.delete(id, user);

    if (!result) {
      throw new BadRequestError("Can't delete target vendor");
    }

    return { success: true, status: "deleted" };
  }
}
