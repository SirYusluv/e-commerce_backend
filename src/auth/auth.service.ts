import { NextFunction, Request, response, Response } from "express";
import {
  changePasswordForEmail,
  createUser,
  findUserWithEmail,
} from "../user/user.service";
import {
  ACCOUNT_TYPES,
  EMAIL_ADDR_PATTERN,
  HTTP_STATUS,
  IResponse,
  JWT_ERROR,
} from "../util/data";
import { CreateUserDto } from "./dtos/create-user.dto";
import { SignInUserDto } from "./dtos/signin-user.dto";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { createLogManager } from "simple-node-logger";
import { ChangePasswordDto } from "./dtos/change-password.dto";
import { emailIsValid } from "../util/helper";
import { getCategoryList, getTopsellingOrLimitedInStockItems } from "../item/item.service";

const logger = createLogManager().createLogger("AuthService.ts");

export interface IAccessToken {
  _id: string;
  emailAddress: string;
  accountType: ACCOUNT_TYPES;
  [key: string]: string; // since jwt can add some metadata like 'iat' (isseud at)
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, emailAddress, password } = req.body;
    const createUserDto = new CreateUserDto(
      firstName,
      lastName,
      emailAddress,
      password
    );
    const { password: _, ...createdUser } = await (
      await createUser(createUserDto)
    ).toObject();
    res.status(HTTP_STATUS.created).json(createdUser);
  } catch (e: any) {
    next(e);
  }
}

export async function signin(req: Request, res: Response, next: NextFunction) {
  try {
    const { emailAddress, password } = req.body;
    const signInUserDto = new SignInUserDto(emailAddress, password);
    let user = await findUserWithEmail(signInUserDto.emailAddress!);
    if (
      !user ||
      !(await bcrypt.compare(signInUserDto.password!, user.password))
    ) {
      const message: IResponse = {
        message: "Incorrect email address or password provided.",
        status: HTTP_STATUS.unauthorized,
      };
      return res.status(HTTP_STATUS.unauthorized).json(message);
    }

    const { password: _, ...signedInUser } = Object.assign(
      { accessToken: "", status: 200 },
      user.toObject()
    );
    const token: IAccessToken = {
      _id: signedInUser._id.toString(),
      emailAddress: signedInUser.emailAddress,
      accountType: signedInUser.accountType!!,
    };
    signedInUser.accessToken = genJwtToken(token)!;
    res.status(HTTP_STATUS.ok).json(signedInUser);
  } catch (err: any) {
    next(err);
  }
}

export async function sendPasswordResetMail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const emailAddress = req.params.email || "";
    if (
      !emailIsValid(emailAddress) ||
      !(await findUserWithEmail(emailAddress))
    ) {
      const message: IResponse = {
        message: "Invalid email address provided",
        status: HTTP_STATUS.badRequest,
      };
      return res.status(message.status).json(message);
    }

    //INFO: send pasword verification mail
    const response: IResponse = {
      message: `Password reset mail has been sent to ${emailAddress}.`,
      status: HTTP_STATUS.ok,
    };
    res.status(response.status).json(response);

    // log the reset link since we don't have the resouce to send mail
    logger.info([
      `${req.headers.host}/auth/reset-password/${genJwtToken({
        emailAddress,
      })}`,
    ]);
  } catch (err: any) {
    next(err);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { emailAddress } = jwt.verify(
      req.params.id,
      process.env.JWT_SECRET!
    ) as { emailAddress: string; [key: string]: any };

    const changePasswordDto = new ChangePasswordDto(
      emailAddress,
      req.body.password
    );
    if (!(await changePasswordForEmail(changePasswordDto))) {
      const response: IResponse = {
        message: "Error changing password. Please try again later.",
        status: HTTP_STATUS.badRequest,
      };
      return res.status(response.status).json(response);
    }

    const response: IResponse = {
      message: "Password successfully updated.",
      status: HTTP_STATUS.ok,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    if (
      err.message === JWT_ERROR.invalidSignature ||
      err.message === JWT_ERROR.jwtMalformed
    ) {
      const response: IResponse = {
        message: "You are not authorized to reset this password.",
        status: HTTP_STATUS.unauthorized,
      };
      return res.status(response.status).json(response);
    }
    next(err);
  }
}

export async function getTopBoughtOrLimited(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { topBought, limited, limit, page } = req.query;
    const response = await getTopsellingOrLimitedInStockItems(
      page ? Number(page.toString()) : 0,
      limit ? Number(limit.toString()) : 10,
      topBought?.toString() === "true"
        ? true
        : topBought?.toString() === "false"
        ? false
        : undefined,
      limited?.toString() === "true"
        ? true
        : limited?.toString() === "false"
        ? false
        : undefined
    );
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}

export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      page: pageQr,
      limit: limitQr,
      sortByReference: sortByReferenceQr,
    } = req.query;
    const page = Number(pageQr?.toString()) || 0;
    const limit = Number(limitQr) || 10;
    const sortByReference =
      sortByReferenceQr?.toString() === "true"
        ? true
        : sortByReferenceQr?.toString() === "false"
        ? false
        : null;

    const categories = await getCategoryList(
      page,
      limit,
      sortByReference || undefined
    );

    const response: IResponse = {
      message: "",
      status: HTTP_STATUS.ok,
      categories,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}

export function genJwtToken(token: string | object) {
  try {
    const accessToken = jwt.sign(token, process.env.JWT_SECRET!);
    return accessToken;
  } catch (err: any) {
    logger.error("fhj: ", err);
    throw err;
  }
}
