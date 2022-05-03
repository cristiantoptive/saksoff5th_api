import { Authorized, Body, JsonController, Delete, Get, Param, Put, Post, BadRequestError, CurrentUser } from "routing-controllers";
import { Inject, Service } from "typedi";

import { CardsService } from "@app/api/services";
import { ViewModel, CardViewModel } from "@app/api/viewmodels";
import { User } from "@app/api/entities/User";
import { CardCommand } from "@app/api/commands";

@Service()
@Authorized()
@JsonController("/cards")
export class CardController {
  @Inject() private cardsService: CardsService;

  @Get()
  public all(@CurrentUser() user: User): Promise<CardViewModel[]> {
    return ViewModel.createMany(CardViewModel, this.cardsService.all(user));
  }

  @Get("/:id")
  public one(@CurrentUser() user: User, @Param("id") id: string): Promise<CardViewModel> {
    return ViewModel.createOne(CardViewModel, this.cardsService.find(id, user));
  }

  @Post()
  public create(@CurrentUser() user: User, @Body() command: CardCommand): Promise<CardViewModel> {
    return ViewModel.createOne(CardViewModel, this.cardsService.create(command, user));
  }

  @Put("/:id")
  public update(@CurrentUser() user: User, @Param("id") id: string, @Body() command: CardCommand): Promise<CardViewModel> {
    return ViewModel.createOne(CardViewModel, this.cardsService.update(id, command, user));
  }

  @Delete("/:id")
  public async delete(@CurrentUser() user: User, @Param("id") id: string): Promise<any> {
    const result = await this.cardsService.delete(id, user);

    if (!result) {
      throw new BadRequestError("Can't delete target card");
    }

    return { success: true, status: "deleted" };
  }
}
