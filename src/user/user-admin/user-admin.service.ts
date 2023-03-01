import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS, IResponse } from "../../util/data";
import { UserAdminCreateUserDto } from "../dtos/user-admin-create-user.dto";
import { createUser } from "../user.service";

export async function userAdminCreateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { firstName, lastName, emailAddress, password, accountType } =
      req.body;
    const userAdminCreateUserDto = new UserAdminCreateUserDto(
      firstName,
      lastName,
      emailAddress,
      password,
      accountType
    );

    const user = await createUser(userAdminCreateUserDto);
    if (!user) {
      const response: IResponse = {
        message: "Error creating user, please try again later",
        status: HTTP_STATUS.ok,
      };
      return res.status(response.status).json(response);
    }

    const { password: _, ...createdUser } = user.toObject();
    res.status(HTTP_STATUS.created).json(createdUser);
  } catch (err: any) {
    next(err);
  }
}
