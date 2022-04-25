import { HttpError } from "routing-controllers";

export class UserAlreadyExistsError extends HttpError {
  constructor() {
    super(400, "Email address is already in use");
  }
}
