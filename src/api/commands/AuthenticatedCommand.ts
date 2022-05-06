import { User } from "@app/api/entities/User";

export abstract class AuthenticatedCommand {
  public currentUser: User;
}
