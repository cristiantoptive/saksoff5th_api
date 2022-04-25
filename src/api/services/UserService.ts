import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { User } from "@app/api/entities/User";
import { UserRepository } from "@app/api/repositories/UserRepository";

@Service()
export class UserService {
  @InjectRepository() private userRepository: UserRepository;

  public find(): Promise<User[]> {
    return this.userRepository.find();
  }

  public findOne(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({ id });
  }

  public findOneByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ email });
  }
}
