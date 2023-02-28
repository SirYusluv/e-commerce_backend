import { NextFunction, Request, response, Response } from "express";
import {
  changePasswordForEmail,
  createUser,
  findUserWithEmail,
} from "../user/user.service";
import { EMAIL_ADDR_PATTERN, HTTP_STATUS, IResponse } from "../util/data";
import { CreateUserDto } from "./dtos/create-user.dto";
import { SignInUserDto } from "./dtos/signin-user.dto";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { createLogManager } from "simple-node-logger";
import { ChangePasswordDto } from "./dtos/change-password.dto";

const logger = createLogManager().createLogger("AuthService.ts");

export interface IAccessToken {
  _id: string;
  emailAddress: string;
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
    const { password: pass, ...createdUser } = await (
      await createUser(createUserDto)
    ).toObject();
    res.status(201).json(createdUser);
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
      _id: user._id.toString(),
      emailAddress: user.emailAddress,
    };
    signedInUser.accessToken = genAccessToken(token);
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
      !emailAddress.match(EMAIL_ADDR_PATTERN) ||
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
      `${req.headers.host}/auth/reset-password/${jwt.sign(
        { emailAddress },
        process.env.JWT_SECRET!
      )}`,
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
    ) as { emailAddress: string };

    console.log("kn\n\n\nn\n\n\n\nggg");

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
    next(err);
  }
}

export function genAccessToken(token: string | object) {
  return jwt.sign(token, process.env.JWT_SECRET!);
}
