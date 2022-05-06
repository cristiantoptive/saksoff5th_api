import { Response, Request } from "express";
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from "routing-controllers";
import { env } from "@app/env";
import { Service } from "typedi";
import { ValidationError } from "class-validator";
import { EntityNotFoundError } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { ErrorLog } from "@app/api/entities/ErrorLog";
import { ErrorLogRepository } from "@app/api/repositories";
import { Logger, LoggerInterface } from "@app/decorators/Logger";

// Error codes that won't be stored in error log table
const HANDLED_ERROR_CODES = [
  400, 401, 404, 409,
];

// Map entities names to human readable name
const ENTITIES_NAMES_MAP = {
  // nothing here so far...
};

@Service()
@Middleware({ type: "after" })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  @InjectRepository() private errorRepository: ErrorLogRepository;

  public isProduction = env.isProduction;

  @Logger(__filename) private log: LoggerInterface;

  public error(error: HttpError|any, req: Request, res: Response): void {
    const responseObject = {} as any;

    // if its an array of ValidationError
    if (error.errors && Array.isArray(error.errors) && error.errors.every((element) => element instanceof ValidationError)) {
      res.status(400);
      responseObject.name = ValidationError.name;
      responseObject.message = "You have an error in your request's body. Check 'errors' field for more details!";
      responseObject.errors = error.errors.reduce((accum, item) => ({ ...accum, [item.property]: item.constraints }), []);
    } else if (error instanceof EntityNotFoundError) { // Handle entity not found errors
      const matches = error.message.match(/"([A-z]*)"/);
      const entityName = ((matches && matches[0]) || "").replace(/"/g, "");
      res.status(404);
      responseObject.name = error.name;
      responseObject.message = `Can not find requested ${ENTITIES_NAMES_MAP[entityName] || entityName}`;
    } else if (error instanceof TokenExpiredError) {
      res.status(401);
      responseObject.name = error.name;
      responseObject.message = "Your session has expired. Sign in again to proceed.";
    } else if (error instanceof JsonWebTokenError) {
      res.status(401);
      responseObject.name = error.name;
      responseObject.message = "Your session is invalid. Sign in again to proceed.";
    } else if (error.name === "AuthorizationRequiredError") {
      res.status(401);
      responseObject.name = error.name;
      responseObject.message = "User authentication is required to proceed.";
    } else {
      // set http status
      if (error instanceof HttpError && error.httpCode) {
        res.status(error.httpCode);
      } else {
        res.status(500);
      }

      if (error instanceof Error) {
        const developmentMode = !this.isProduction;

        // set response error fields
        if (error.name && (developmentMode || error.message)) { // show name only if in development mode and if error message exist too
          responseObject.name = error.name;
        }
        if (error.message) {
          responseObject.message = error.message;
        }
        if (error.stack && developmentMode) {
          responseObject.stack = error.stack;
        }
      } else if (typeof error === "string") {
        responseObject.message = error;
      }
    }

    if (!env.isTest && !HANDLED_ERROR_CODES.includes(res.statusCode)) {
      try {
        this.errorRepository.save(ErrorLog.fromData({
          name: error.name || responseObject.name,
          stack: error.stack || error,
          message: responseObject.message || error.message,
        }));
      } catch (ex) {
        this.log.error(ex.toString());
      }
    }

    // send json only with error
    res.json(responseObject);
  }
}
