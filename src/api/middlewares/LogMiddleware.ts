import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Logger } from "@app/lib/logger";
import { env } from "@app/env";
import { Service } from "typedi";

@Service()
@Middleware({ type: "before" })
export class LogMiddleware implements ExpressMiddlewareInterface {
  private log = new Logger(__dirname);

  public use(req: Request, res: Response, next: NextFunction): any {
    return morgan(env.log.output, {
      stream: {
        write: this.log.info.bind(this.log),
      },
    })(req, res, next);
  }
}
