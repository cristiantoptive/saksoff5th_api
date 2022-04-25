import { EntityRepository, Repository } from "typeorm";
import { Service } from "typedi";
import { ErrorLog } from "@app/api/entities/ErrorLog";

@Service()
@EntityRepository(ErrorLog)
export class ErrorLogRepository extends Repository<ErrorLog> {
}
