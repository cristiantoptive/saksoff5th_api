import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { UploadRelatedTo } from "@app/api/types";
import { AuthenticatedCommand } from "./AuthenticatedCommand";

@JSONSchema({
  description: "This model is used to upload new files",
})
export class CreateUploadCommand extends AuthenticatedCommand {
  @IsEnum(UploadRelatedTo, {
    message: "source entity type is not valid",
  })
  @IsNotEmpty({
    message: "source entity type is required",
  })
  public source: UploadRelatedTo;

  @IsString()
  @IsNotEmpty({
    message: "source entity id is required",
  })
  public sourceId: string;

  @IsString({
    message: "upload name is required",
  })
  public name: string;

  @IsString()
  @IsOptional()
  public description: string;

  @IsString()
  @IsNotEmpty({
    message: "upload type is required",
  })
  public type: string;

  // @IsNumber({

  // })
  public size: number;
}

@JSONSchema({
  description: "This model is used to modify existing uploads",
})
export class UpdateUploadCommand extends AuthenticatedCommand {
  @IsString()
  @IsOptional()
  public description: string;
}
