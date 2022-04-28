import { IsNotEmpty, IsString, MaxLength, IsDate } from "class-validator";

export class CreateCardCommand {
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

  @IsDate()
  @IsNotEmpty({
    message: "Card expiration date is required",
  })
  public expiresOn: Date;
}
