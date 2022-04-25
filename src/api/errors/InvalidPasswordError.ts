import { HttpError } from "routing-controllers";

export class InvalidPasswordError extends HttpError {
  constructor(element: string) {
    super(400, element);
  }
}
