import { EntityRepository, Repository } from "typeorm";
import { Service } from "typedi";
import { User } from "@app/api/entities/User";

@Service()
@EntityRepository(User)
export class UserRepository extends Repository<User> {
}
