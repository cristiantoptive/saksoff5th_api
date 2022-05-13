import { Action } from "routing-controllers";
import { Container } from "typedi";

import { Logger } from "@app/lib/logger";
import { AuthService, UserService } from "@app/api/services";
import { Roles } from "@app/api/types";

export function authorizationChecker(): (action: Action, roles: any[]) => Promise<boolean> | boolean {
  const log = new Logger(__filename);

  const authService = Container.get<AuthService>(AuthService);
  const userService = Container.get<UserService>(UserService);

  return async function innerAuthorizationChecker(action: Action, roles: string[]): Promise<boolean> {
    const allowGuest = roles && roles.length && roles.includes(Roles.Guest);
    const authToken = authService.parseAuthFromRequest(action.request);

    if (authToken === undefined && !allowGuest) {
      log.warn("No credentials given");
      return false;
    }

    const decodedToken = authToken ? authService.validateAuthToken(authToken) : null;
    if (!decodedToken) {
      if (!allowGuest) {
        log.warn("Invalid token");
        return false;
      } else {
        log.warn("Allowed guest user");
        return true;
      }
    }

    const { data: tokenData } = decodedToken;
    if (roles && roles.length && !roles.includes(tokenData.role)) {
      log.warn("Invalid user role");
      return false;
    }

    action.request.user = await userService.find(tokenData.id, false);

    if (action.request.body) {
      action.request.body.currentUser = action.request.user;
    }

    if (action.request.user === undefined) {
      log.warn("Invalid credentials given");
      return false;
    }

    const updatedToken = authService.generateAuthToken(action.request.user);
    action.response.setHeader("authorization", updatedToken);

    log.info("Successfully checked credentials");
    return true;
  };
}
