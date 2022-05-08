import { Authorized, Body, JsonController, Delete, Get, Param, Put, Post, BadRequestError, CurrentUser } from "routing-controllers";
import { Inject, Service } from "typedi";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";

import { CardsService } from "@app/api/services";
import { ViewModel, CardViewModel, DeletedViewModel } from "@app/api/viewmodels";
import { User } from "@app/api/entities/User";
import { CardCommand } from "@app/api/commands";

@Service()
@Authorized()
@JsonController("/cards")
export class CardController {
  @Inject() private cardsService: CardsService;

  @Get()
  @OpenAPI({ summary: "Retrieve all credit cards from the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(CardViewModel, { isArray: true })
  public all(@CurrentUser() user: User): Promise<CardViewModel[]> {
    return ViewModel.createMany(CardViewModel, this.cardsService.all(user));
  }

  @Get("/:id")
  @OpenAPI({ summary: "Retrieve one credit card by id from the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(CardViewModel)
  public one(@CurrentUser() user: User, @Param("id") id: string): Promise<CardViewModel> {
    return ViewModel.createOne(CardViewModel, this.cardsService.find(id, user));
  }

  @Post()
  @OpenAPI({ summary: "Create a new credit card for the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(CardViewModel)
  public create(@CurrentUser() user: User, @Body() command: CardCommand): Promise<CardViewModel> {
    return ViewModel.createOne(CardViewModel, this.cardsService.create(command, user));
  }

  @Put("/:id")
  @OpenAPI({ summary: "Updated existing credit card by id for the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(CardViewModel)
  public update(@CurrentUser() user: User, @Param("id") id: string, @Body() command: CardCommand): Promise<CardViewModel> {
    return ViewModel.createOne(CardViewModel, this.cardsService.update(id, command, user));
  }

  @Delete("/:id")
  @OpenAPI({ summary: "Delete existing card by id from the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(DeletedViewModel)
  public async delete(@CurrentUser() user: User, @Param("id") id: string): Promise<DeletedViewModel> {
    const result = await this.cardsService.delete(id, user);

    if (!result || !result.affected) {
      throw new BadRequestError("Can't delete target card");
    }

    return ViewModel.createOne(DeletedViewModel, { success: true, status: "deleted" });
  }
}
