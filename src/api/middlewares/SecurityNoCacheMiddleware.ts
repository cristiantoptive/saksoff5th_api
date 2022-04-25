import { Request, Response, NextFunction } from "express";
import nocache from "nocache";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Service } from "typedi";

@Service()
@Middleware({ type: "before" })
export class SecurityNoCacheMiddleware implements ExpressMiddlewareInterface {
  public use(req: Request, res: Response, next: NextFunction): any {
    return nocache()(req, res, next);
  }
}
