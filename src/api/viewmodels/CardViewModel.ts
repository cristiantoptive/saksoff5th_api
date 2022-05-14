import { IsString, IsDate } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { ViewModel } from "./ViewModel";
import { Card } from "@app/api/entities/Card";

@JSONSchema({
  description: "User credit card view model",
})
export class CardViewModel extends ViewModel {
  @IsString()
  public id: string;

  @IsString()
  public name: string;

  @IsString()
  public number: string;

  @IsDate()
  public expiresOn: Date;

  public construct(card: Card): Promise<CardViewModel> {
    return super.mapObjectKeys({
      id: card.id,
      name: card.name,
      number: `************${card.number.substring(12)}`,
      expiresOn: new Date(card.expiresOn).toISOString(),
    });
  }
}
