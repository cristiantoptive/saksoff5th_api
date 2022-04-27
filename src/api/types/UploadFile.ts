export interface UploadFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

// eslint-disable-next-line no-shadow
export enum UploadRelatedTo {
  Product = "product",
}
