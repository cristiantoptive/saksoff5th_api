import compression from "compression";
import { Response, Request, NextFunction } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Service } from "typedi";

@Service()
@Middleware({ type: "before" })
export class CompressionMiddleware implements ExpressMiddlewareInterface {
  public use(req: Request, res: Response, next: NextFunction): any {
    return compression()(req, res, next);
  }
}
