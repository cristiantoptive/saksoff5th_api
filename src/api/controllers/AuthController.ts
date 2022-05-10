import { Authorized, Body, CurrentUser, Get, JsonController, NotFoundError, Post, Put } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { Inject, Service } from "typedi";

import { ChangePasswordCommand, SigninCommand, SignupCommand } from "@app/api/commands";
import { ViewModel, UserViewModel, AuthTokenViewModel } from "@app/api/viewmodels";
import { AuthService } from "@app/api/services";
import { User } from "@app/api/entities/User";

@Service()
@JsonController("/auth")
export class AuthController {
  @Inject() private authService: AuthService;

  @Post("/signin")
  @OpenAPI({ summary: "Authenticate and generate auth token" })
  @ResponseSchema(AuthTokenViewModel)
  public async signin(@Body() credentials: SigninCommand): Promise<AuthTokenViewModel> {
    try {
      const user = await this.authService.validateUser(credentials.email, credentials.password);
      return ViewModel.createOne(AuthTokenViewModel, { user, token: this.authService.generateAuthToken(user) });
    } catch {
      throw new NotFoundError("Username or password are wrong.");
    }
  }

  @Post("/signup")
  @OpenAPI({ summary: "Register a new user" })
  @ResponseSchema(AuthTokenViewModel)
  public async signup(@Body() command: SignupCommand): Promise<AuthTokenViewModel> {
    const user = await this.authService.createUser(command);
    return ViewModel.createOne(AuthTokenViewModel, { user, token: this.authService.generateAuthToken(user) });
  }

  @Get("/user")
  @Authorized()
  @OpenAPI({ summary: "Return authenticated user data", security: [{ bearerAuth: [] }] })
  @ResponseSchema(UserViewModel)
  public current(@CurrentUser() user: User): Promise<UserViewModel> {
    return ViewModel.createOne(UserViewModel, user);
  }

  @Put("/changePassword")
  @Authorized()
  @OpenAPI({ summary: "Change password of authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(UserViewModel)
  public changePassword(@CurrentUser() user: User, @Body() command: ChangePasswordCommand): Promise<UserViewModel> {
    return ViewModel.createOne(UserViewModel, this.authService.changePassword(user, command));
  }
}
