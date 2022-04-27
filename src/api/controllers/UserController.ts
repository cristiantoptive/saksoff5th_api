import { Authorized, Body, JsonController, CurrentUser, Delete, ForbiddenError, Get, Param, Put, Post } from "routing-controllers";
import { Inject, Service } from "typedi";

import { UpdateUserCommand, CreateUserCommand } from "@app/api/commands/users";
import { ViewModel, UserExcerptViewModel } from "@app/api/viewmodels";
import { UserService } from "@app/api/services";
import { User } from "@app/api/entities/User";
import { Roles } from "@app/api/types";

@Service()
@JsonController("/users")
@Authorized()
export class UserController {
  @Inject() private userService: UserService;

  @Get()
  public async getAll(): Promise<UserExcerptViewModel[]> {
    return ViewModel.createMany(UserExcerptViewModel, this.userService.find());
  }

  @Get("/:id")
  public async getOne(@Param("id") id: string): Promise<UserExcerptViewModel> {
    return ViewModel.createOne(UserExcerptViewModel, this.userService.findOne(id));
  }

  @Post()
  @Authorized([Roles.Admin])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public addUser(@Body() user: CreateUserCommand): void {
    throw new ForbiddenError();
  }

  @Put("/:id")
  @Authorized([Roles.Admin])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public updateUser(@Param("id") id: number, @Body() user: UpdateUserCommand): void {
    throw new ForbiddenError();
  }

  @Delete("/:id")
  @Authorized([Roles.Admin])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public removeUser(@Param("id") id: number, @CurrentUser() user: User): void {
    throw new ForbiddenError();
  }
}
