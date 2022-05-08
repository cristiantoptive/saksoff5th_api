import { IsNotEmpty, IsString, MaxLength, IsDateString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { AuthenticatedCommand } from "./AuthenticatedCommand";

@JSONSchema({
  description: "This model is used to create or update user payment card",
})
export class CardCommand extends AuthenticatedCommand {
  @IsString()
  @IsNotEmpty({
    message: "Card holder name is required",
  })
  @MaxLength(255, {
    message: "Card holder name can't have more than 255 characters",
  })
  public name: string;

  @IsString()
  @IsNotEmpty({
    message: "Card number is required",
  })
  @MaxLength(19, {
    message: "Card number can't have more than 19 characters",
  })
  public number: string;

  @IsDateString()
  @IsNotEmpty({
    message: "Card expiration date is required",
  })
  public expiresOn: string;
}
