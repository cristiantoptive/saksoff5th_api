import { Body, Controller, JsonController, Get, Param, Post, Delete, UploadedFile, Authorized, Res, Put, BadRequestError } from "routing-controllers";
import { Inject, Service } from "typedi";
import { Response } from "express";

import { CreateUploadCommand, UpdateUploadCommand } from "@app/api/commands";
import { ViewModel, UploadViewModel, DeletedViewModel } from "@app/api/viewmodels/";
import { UploadService } from "@app/api/services";
import { UploadFile } from "@app/api/types/UploadFile";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";

@Service()
@JsonController("/upload")
export class UploadController {
  @Inject() private uploadService: UploadService;

  @Get("/:id")
  @OpenAPI({ summary: "Retrieve file binary from existing upload" })
  public async download(@Param("id") id: string, @Res() response: Response): Promise<any> {
    const data = await this.uploadService.download(id);

    response.attachment(data.name);
    response.send(data.content);

    return response;
  }

  @Put("/:id")
  @Authorized()
  @OpenAPI({ summary: "Update existing upload by id for the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(UploadViewModel)
  public async put(@Param("id") id: string, @Body() command: UpdateUploadCommand): Promise<UploadViewModel> {
    return ViewModel.createOne(UploadViewModel, this.uploadService.update(id, command));
  }

  @Delete("/:id")
  @Authorized()
  @OpenAPI({ summary: "Delete existing upload by id from the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(DeletedViewModel)
  public async remove(@Param("id") id: string): Promise<DeletedViewModel> {
    const result = await this.uploadService.delete(id);

    if (!result) {
      throw new BadRequestError("Can't delete target upload");
    }

    return ViewModel.createOne(DeletedViewModel, { success: true, status: "deleted" });
  }
}

@Service()
@Controller("/upload")
@Authorized()
export class UploadFormDataController {
  @Inject() private uploadService: UploadService;

  @Post("/")
  @OpenAPI({ summary: "Create a new upload for the authenticated user", security: [{ bearerAuth: [] }] })
  @ResponseSchema(UploadViewModel)
  public async post(@Body() command: CreateUploadCommand, @UploadedFile("file", { required: true }) file: UploadFile): Promise<UploadViewModel> {
    return ViewModel.createOne(UploadViewModel, this.uploadService.create(command, file));
  }
}
