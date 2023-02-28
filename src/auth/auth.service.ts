import { NextFunction, Request, Response } from "express";
import { createUser, findUserWithEmail } from "../user/user.service";
import { HTTP_STATUS, IResponse } from "../util/data";
import { CreateUserDto } from "./dtos/create-user.dto";
import { SignInUserDto } from "./dtos/signin-user.dto";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

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

export function genAccessToken(token: string | object) {
  return jwt.sign(token, process.env.JWT_SECRET!);
}
