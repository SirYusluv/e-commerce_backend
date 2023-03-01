import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { IAccessToken } from "../auth/auth.service";
import { User } from "../user/user.schema";
import { findUserWithEmail } from "../user/user.service";
import { HTTP_STATUS, IResponse } from "../util/data";
import { extractTokenFromBearer } from "../util/helper";

export async function isAuthenticatedGuard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const decodedToken = jwt.verify(
      extractTokenFromBearer(req.headers?.authorization || ""),
      process.env.JWT_SECRET!
    ) as IAccessToken;

    const user = await findUserWithEmail(decodedToken.emailAddress);
    if (!user) {
      const response: IResponse = {
        message: "Invalid authentication. Please log out and login.",
        status: HTTP_STATUS.unauthorized,
      };
      return res.status(response.status).json(response);
    }

    req.body.user = user;
    next();
  } catch (err: any) {
    next(err);
  }
}
