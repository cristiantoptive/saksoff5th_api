import { EntityRepository, Repository } from "typeorm";
import { Service } from "typedi";
import { Vendor } from "@app/api/entities/Vendor";

@Service()
@EntityRepository(Vendor)
export class VendorRepository extends Repository<Vendor> {
}
