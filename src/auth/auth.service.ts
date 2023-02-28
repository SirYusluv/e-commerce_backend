import { NextFunction, Request, Response } from "express";
import { createUser } from "../user/user.service";
import { CreateUserDto } from "./dtos/create-user.dto";

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
