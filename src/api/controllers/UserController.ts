import { Authorized, Body, JsonController, CurrentUser, Delete, ForbiddenError, Get, Param, Put, Post, BadRequestError } from "routing-controllers";
import { Inject, Service } from "typedi";

import { UserCommand } from "@app/api/commands";
import { ViewModel, UserExcerptViewModel, UserViewModel } from "@app/api/viewmodels";
import { UserService } from "@app/api/services";
import { User } from "@app/api/entities/User";
import { Roles } from "@app/api/types";

@Service()
@JsonController("/users")
export class UserController {
  @Inject() private userService: UserService;

  @Get()
  @Authorized()
  public all(): Promise<UserExcerptViewModel[]> {
    return ViewModel.createMany(UserExcerptViewModel, this.userService.all());
  }

  @Get("/:id")
  @Authorized()
  public one(@Param("id") id: string): Promise<UserExcerptViewModel> {
    return ViewModel.createOne(UserExcerptViewModel, this.userService.find(id));
  }

  @Post()
  @Authorized([Roles.Admin])
  public create(@Body() command: UserCommand): Promise<UserViewModel> {
    return ViewModel.createOne(UserViewModel, this.userService.create(command));
  }

  @Put("/:id")
  @Authorized([Roles.Admin])
  public update(@Param("id") id: string, @Body() command: UserCommand): Promise<UserViewModel> {
    return ViewModel.createOne(UserViewModel, this.userService.update(id, command));
  }

  @Delete("/:id")
  @Authorized([Roles.Admin])
  public async remove(@Param("id") id: string, @CurrentUser() user: User): Promise<any> {
    if (id === user.id) {
      throw new ForbiddenError("Can't remove your self");
    }

    const result = await this.userService.delete(id);

    if (!result || !result.affected) {
      throw new BadRequestError("Can't delete target user");
    }

    return { success: true, status: "deleted" };
  }
}
