import { EntityRepository, Repository } from "typeorm";
import { Service } from "typedi";
import { Upload } from "@app/api/entities/Upload";

@Service()
@EntityRepository(Upload)
export class UploadRepository extends Repository<Upload> {
}
