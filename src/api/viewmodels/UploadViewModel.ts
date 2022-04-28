import { Upload } from "@app/api/entities/Upload";
import { ViewModel } from "./ViewModel";

export class UploadViewModel extends ViewModel {
  construct(upload: Upload): Promise<UploadViewModel> {
    return super.mapObjectKeys({
      id: upload.id,
      name: upload.name,
      type: upload.type,
      size: upload.size,
    });
  }
}
