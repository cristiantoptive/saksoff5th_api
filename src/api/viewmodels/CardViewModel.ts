import { IsString, IsDate } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ViewModel } from "./ViewModel";
import { Card } from "@app/api/entities/Card";

@JSONSchema({
  description: "Card view model",
})
export class CardViewModel extends ViewModel {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  number: string;

  @IsDate()
  expiresOn: Date;

  construct(card: Card): Promise<CardViewModel> {
    return super.mapObjectKeys({
      id: card.id,
      name: card.name,
      number: card.number,
      expiresOn: card.expiresOn,
    });
  }
}
