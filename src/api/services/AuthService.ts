import { Request } from "express";
import { Service } from "typedi";
import * as jwt from "jsonwebtoken";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UserRepository } from "@app/api/repositories/UserRepository";
import { User } from "@app/api/entities/User";
import { Roles } from "@app/api/types/Roles";
import { ChangePasswordCommand, SignupCommand } from "@app/api/commands";

import { env } from "@app/env";

@Service()
export class AuthService {
  @InjectRepository() private userRepository: UserRepository;

  public parseAuthFromRequest(req: Request): string {
    const authorization = (req.header("authorization") || "").split(" ");

    if (authorization[0] === "Bearer") {
      return authorization[1];
    }

    return undefined;
  }

  public validateAuthToken(token: string): any {
    return jwt.verify(token, env.app.jtwSecret);
  }

  public async createUser(command: SignupCommand): Promise<User> {
    const user = User.fromData({ ...command, role: Roles.Customer });
    return this.userRepository.save(user);
  }

  public async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOneOrFail({
      where: {
        email,
      },
    });

    if (await User.comparePassword(user, password)) {
      return user;
    }

    return undefined;
  }

  public generateAuthToken(user: User): string {
    return jwt.sign({
      data: {
        id: user.id,
        role: user.role,
      },
    }, env.app.jtwSecret, { expiresIn: env.app.jtwExpires });
  }

  public async changePassword(user: User, passwords: ChangePasswordCommand): Promise<User> {
    User.updateData(user, {
      password: await User.hashPassword(passwords.newPassword),
    });

    return this.userRepository.save(user);
  }
}
