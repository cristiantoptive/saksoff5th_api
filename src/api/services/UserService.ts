import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { User } from "@app/api/entities/User";
import { UserRepository } from "@app/api/repositories/UserRepository";
import { UserAlreadyExistsError } from "@app/api/errors";
import { UserCommand } from "@app/api/commands";
import { DeleteResult } from "typeorm";

@Service()
export class UserService {
  @InjectRepository() private userRepository: UserRepository;

  public all(): Promise<User[]> {
    return this.userRepository.find();
  }

  public find(id: string, failIfDoesntExists: boolean = true): Promise<User | undefined> {
    if (failIfDoesntExists) {
      return this.userRepository.findOneOrFail({ id });
    }

    return this.userRepository.findOne({ id });
  }

  public async create(command: UserCommand): Promise<User> {
    const existingUser = await this.userRepository.findOne({ email: command.email });
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    const user = this.userRepository.create(
      User.fromData({
        email: command.email,
        password: command.password,
        role: command.role,
        firstName: command.firstName,
        lastName: command.lastName,
      }),
    );

    return this.userRepository.save(user);
  }

  public async update(id: string, command: UserCommand): Promise<User> {
    const user = await this.find(id);

    if (command.email !== user.email) {
      const existingUser = await this.userRepository.findOne({ email: command.email });
      if (existingUser) {
        throw new UserAlreadyExistsError();
      }
    }

    User.updateData(user, {
      email: command.email,
      password: await User.hashPassword(command.password),
      role: command.role,
      firstName: command.firstName,
      lastName: command.lastName,
    });

    return this.userRepository.save(user);
  }

  public async delete(id: string): Promise<DeleteResult> {
    return this.userRepository.delete(id);
  }
}
