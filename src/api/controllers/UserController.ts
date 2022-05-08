import { Authorized, Body, JsonController, CurrentUser, Delete, ForbiddenError, Get, Param, Put, Post, BadRequestError } from "routing-controllers";
import { Inject, Service } from "typedi";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";

import { UserCommand } from "@app/api/commands";
import { ViewModel, UserExcerptViewModel, UserViewModel, DeletedViewModel } from "@app/api/viewmodels";
import { UserService } from "@app/api/services";
import { User } from "@app/api/entities/User";
import { Roles } from "@app/api/types";

@Service()
@JsonController("/users")
export class UserController {
  @Inject() private userService: UserService;

  @Get()
  @Authorized()
  @OpenAPI({ summary: "Retrieve an simplified view of all users existing on the system", security: [{ bearerAuth: [] }] })
  @ResponseSchema(UserExcerptViewModel, { isArray: true })
  public all(): Promise<UserExcerptViewModel[]> {
    return ViewModel.createMany(UserExcerptViewModel, this.userService.all());
  }

  @Get("/:id")
  @Authorized()
  @OpenAPI({ summary: "Retrieve a simplified view of a single user by id", security: [{ bearerAuth: [] }] })
  @ResponseSchema(UserExcerptViewModel)
  public one(@Param("id") id: string): Promise<UserExcerptViewModel> {
    return ViewModel.createOne(UserExcerptViewModel, this.userService.find(id));
  }

  @Post()
  @Authorized([Roles.Admin])
  @OpenAPI({ summary: "Create new user (only admin)", security: [{ bearerAuth: [] }] })
  @ResponseSchema(UserViewModel)
  public create(@Body() command: UserCommand): Promise<UserViewModel> {
    return ViewModel.createOne(UserViewModel, this.userService.create(command));
  }

  @Put("/:id")
  @Authorized([Roles.Admin])
  @OpenAPI({ summary: "Update one user by id (only admin)", security: [{ bearerAuth: [] }] })
  @ResponseSchema(UserViewModel)
  public update(@Param("id") id: string, @Body() command: UserCommand): Promise<UserViewModel> {
    return ViewModel.createOne(UserViewModel, this.userService.update(id, command));
  }

  @Delete("/:id")
  @Authorized([Roles.Admin])
  @OpenAPI({ summary: "Remove one user by id (only admin)", security: [{ bearerAuth: [] }] })
  @ResponseSchema(DeletedViewModel)
  public async remove(@Param("id") id: string, @CurrentUser() user: User): Promise<DeletedViewModel> {
    if (id === user.id) {
      throw new ForbiddenError("Can't remove your self");
    }

    const result = await this.userService.delete(id);

    if (!result || !result.affected) {
      throw new BadRequestError("Can't delete target user");
    }

    return ViewModel.createOne(DeletedViewModel, { success: true, status: "deleted" });
  }
}
