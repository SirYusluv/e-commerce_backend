import { Request, Response, NextFunction } from "express";
import { ACCOUNT_TYPES, HTTP_STATUS, IResponse } from "../../util/data";
import { getSupportedAccounts } from "../../util/helper";
import { FindUsersDto } from "../dtos/find-users.dto";
import { UserAdminCreateUserDto } from "../dtos/user-admin-create-user.dto";
import { createUser, findUsers } from "../user.service";

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

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      firstName: firstNameQr,
      lastName: lastNameQr,
      address: addressQr,
      contact: contactQr,
      isBlocked: isBlockedQr,
      accountType: accountTypeQr,
      limit: limitQr,
      skip: skipQr,
    } = req.query;

    const firstName = firstNameQr && firstNameQr.toString();
    const lastName = lastNameQr && lastNameQr.toString();
    const address = addressQr && addressQr.toString();
    const contact = contactQr && contactQr.toString();
    const isBlocked =
      isBlockedQr === "true"
        ? true
        : isBlockedQr === "false"
        ? false
        : undefined;
    const accountType = getSupportedAccounts().includes(
      accountTypeQr?.toString() as any
    )
      ? (accountTypeQr!!.toString() as ACCOUNT_TYPES)
      : undefined;
    let limit: number | undefined = undefined;
    let skip: number | undefined = undefined;
    if (limitQr) {
      try {
        limit = Number(limitQr);
      } catch (err: any) {}
    }
    if (skipQr) {
      try {
        skip = Number(skipQr);
      } catch (err: any) {}
    }

    const findUsersDto = new FindUsersDto(
      firstName,
      lastName,
      address,
      contact,
      isBlocked,
      accountType
    );
    const users = await findUsers(findUsersDto, limit, skip);
    const response: IResponse = { message: "", status: HTTP_STATUS.ok, users };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}
