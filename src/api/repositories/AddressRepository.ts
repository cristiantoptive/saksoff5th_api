import { EntityRepository, Repository } from "typeorm";
import { Service } from "typedi";
import { Address } from "@app/api/entities/Address";

@Service()
@EntityRepository(Address)
export class AddressRepository extends Repository<Address> {
}
