import { Authorized, Body, JsonController, Delete, Get, Param, Put, Post, BadRequestError, CurrentUser, QueryParam } from "routing-controllers";
import { Inject, Service } from "typedi";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";

import { VendorService } from "@app/api/services";
import { ViewModel, VendorViewModel, DeletedViewModel } from "@app/api/viewmodels";
import { Roles } from "@app/api/types";
import { User } from "@app/api/entities/User";
import { VendorCommand } from "@app/api/commands";

@Service()
@JsonController("/vendors")
export class VendorController {
  @Inject() private vendorsService: VendorService;

  @Get()
  @OpenAPI({ summary: "List all vendors. Use query param 'onlyMine' to list all the vendors created by the authenticated user" })
  @ResponseSchema(VendorViewModel, { isArray: true })
  public all(@CurrentUser({ required: false }) user?: User, @QueryParam("onlyMine") onlyMine?: boolean): Promise<VendorViewModel[]> {
    return ViewModel.createMany(VendorViewModel, this.vendorsService.all(user, onlyMine));
  }

  @Get("/:id")
  @OpenAPI({ summary: "Detailed view of a single vendor" })
  @ResponseSchema(VendorViewModel)
  public one(@Param("id") id: string): Promise<VendorViewModel> {
    return ViewModel.createOne(VendorViewModel, this.vendorsService.find(id));
  }

  @Post()
  @Authorized([Roles.Merchandiser])
  @OpenAPI({ summary: "Create new vendor (only merchandiser)", security: [{ bearerAuth: [] }] })
  @ResponseSchema(VendorViewModel)
  public create(@CurrentUser() user: User, @Body() command: VendorCommand): Promise<VendorViewModel> {
    return ViewModel.createOne(VendorViewModel, this.vendorsService.create(command, user));
  }

  @Put("/:id")
  @Authorized([Roles.Merchandiser])
  @OpenAPI({ summary: "Update one vendor by id (only merchandiser)", security: [{ bearerAuth: [] }] })
  @ResponseSchema(VendorViewModel)
  public update(@CurrentUser() user: User, @Param("id") id: string, @Body() command: VendorCommand): Promise<VendorViewModel> {
    return ViewModel.createOne(VendorViewModel, this.vendorsService.update(id, command, user));
  }

  @Delete("/:id")
  @Authorized([Roles.Merchandiser])
  @OpenAPI({ summary: "Remove one product by id (only merchandiser)", security: [{ bearerAuth: [] }] })
  @ResponseSchema(DeletedViewModel)
  public async delete(@CurrentUser() user: User, @Param("id") id: string): Promise<DeletedViewModel> {
    const result = await this.vendorsService.delete(id, user);

    if (!result || !result.affected) {
      throw new BadRequestError("Can't delete target vendor");
    }

    return ViewModel.createOne(DeletedViewModel, { success: true, status: "deleted" });
  }
}
