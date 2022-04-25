import { Action } from "routing-controllers";
import { User } from "@app/api/entities/User";

export function currentUserChecker(): (action: Action) => Promise<User | undefined> {
  return function innerCurrentUserChecker(action: Action): Promise<User | undefined> {
    return action.request.user;
  };
}
