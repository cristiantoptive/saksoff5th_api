import { IsNumber, IsOptional, IsString } from "class-validator";
import { JSONSchema } from "class-validator-jsonschema";
import { Upload } from "@app/api/entities/Upload";
import { ViewModel } from "./ViewModel";

@JSONSchema({
  description: "Upload view model",
})
export class UploadViewModel extends ViewModel {
  @IsString()
  public id: string;

  @IsString()
  public name: string;

  @IsString()
  public type: string;

  @IsNumber()
  public size: number;

  @IsString()
  @IsOptional()
  public description: string;

  public construct(upload: Upload): Promise<UploadViewModel> {
    return super.mapObjectKeys({
      id: upload.id,
      name: upload.name,
      type: upload.type,
      size: upload.size,
      description: upload.description,
    });
  }
}
