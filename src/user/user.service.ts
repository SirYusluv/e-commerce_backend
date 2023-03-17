import { CreateUserDto } from "../auth/dtos/create-user.dto";
import { User, UserType } from "./user.schema";
import * as bcrypt from "bcrypt";
import {
  ACCOUNTS,
  BCRYPT_SALT,
  CREATOR,
  HTTP_STATUS,
  IResponse,
  MONGOOSE_STATUS,
  SPLIT_PATTERN,
} from "../util/data";
import { createLogManager } from "simple-node-logger";
import { ChangePasswordDto } from "../auth/dtos/change-password.dto";
import { UserAdminCreateUserDto } from "./dtos/user-admin-create-user.dto";
import { FindUsersDto } from "./dtos/find-users.dto";
import { NextFunction, Request, Response } from "express";
import { ModifyUserDto } from "./dtos/modify-user.dto";
import { getSupportedAccounts } from "../util/helper";
import { Types } from "mongoose";

const logger = createLogManager().createLogger("UserService.ts");

export async function modifyUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      emailAddress: emailAddressQr,
      firstName: firstNameQr,
      lastName: lastNameQr,
      address: addressQr,
      contact: contactQr,
      isBlocked: isBlockedQr,
    } = req.query;

    const { emailAddress, firstName, lastName, address, contact, isBlocked } = {
      emailAddress: emailAddressQr?.toString(),
      firstName: firstNameQr?.toString(),
      lastName: lastNameQr?.toString(),
      address: addressQr?.toString(),
      contact: contactQr?.toString(),
      isBlocked:
        isBlockedQr?.toString() === "true"
          ? true
          : isBlockedQr?.toString() === "false"
          ? false
          : undefined,
    };
    const { password } = req.body;
    const user = req.body.user as UserType;

    const modifyUserDto = new ModifyUserDto(
      firstName,
      lastName,
      emailAddress,
      password,
      address,
      contact,
      isBlocked
    );

    // only admin has the permission to set isBlock
    if (modifyUserDto.isBlocked && user.accountType !== ACCOUNTS.userAdmin) {
      const response: IResponse = {
        message: "You are not authorized to block or unblock any user.",
        status: HTTP_STATUS.unauthorized,
      };
      return res.status(response.status).json(response);
    }

    user.firstName = modifyUserDto.firstName || user.firstName;
    user.lastName = modifyUserDto.lastName || user.lastName;
    user.emailAddress = modifyUserDto.emailAddress || user.emailAddress;
    user.password = modifyUserDto.password || user.password;
    user.address = modifyUserDto.address || user.address;
    user.contact = modifyUserDto.contact || user.contact;
    user.isBlocked =
      modifyUserDto.isBlocked === true
        ? modifyUserDto.isBlocked
        : modifyUserDto.isBlocked === false
        ? false
        : user.isBlocked;
    user.password = !!modifyUserDto.password
      ? await bcrypt.hash(modifyUserDto.password, BCRYPT_SALT)
      : user.password;

    await user.save();

    const { password: _, ...userToSendAsResponse } = user.toObject();

    const response: IResponse = {
      message: "User data modified successfully.",
      status: HTTP_STATUS.created,
      user: userToSendAsResponse,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}

export function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    let _id: string | Types.ObjectId = req.params.userId;
    const user = req.body.user as UserType;

    _id = new Types.ObjectId(_id);

    if (!user._id.equals(_id) || user.accountType !== ACCOUNTS.userAdmin) {
      const response: IResponse = {
        message: "You are not authorized to delete this user.",
        status: HTTP_STATUS.forbidden,
      };
      return res.status(response.status).json(response);
    }

    User.findByIdAndDelete(_id).exec();

    const response: IResponse = {
      message: "User deleted successfully",
      status: HTTP_STATUS.ok,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}

export function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { password, ...user } = (req.body.user as UserType).toObject();
    const response: IResponse = {
      message: "",
      status: HTTP_STATUS.ok,
      user,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}

export const createUser = async function (
  userToCreate: CreateUserDto | UserAdminCreateUserDto
) {
  try {
    const user = new User(userToCreate);
    if (userToCreate instanceof UserAdminCreateUserDto)
      user.createdBy = CREATOR.userAdmin;
    user.password = await bcrypt.hash(user.password, BCRYPT_SALT);
    const createdUser = await user.save();
    return createdUser;
  } catch (err: any) {
    logger.error(err);
    if (err.code === MONGOOSE_STATUS.duplicateError) {
      throw new Error(
        `${
          Object.entries(err.keyValue || { value: "value" })[0][1]
        } is already in use.${SPLIT_PATTERN}${HTTP_STATUS.conflict}`
      );
    }

    throw new Error(
      `Error creating user, please try again later${SPLIT_PATTERN}${HTTP_STATUS.internalServerError}`
    );
  }
};

export async function changePasswordForEmail(
  changePasswordDto: ChangePasswordDto
) {
  const user = await findUserWithEmail(changePasswordDto.emailAddress!);
  if (!user) return user;

  user.password = await bcrypt.hash(changePasswordDto.password!, BCRYPT_SALT);
  return user.save();
}

export const findUserWithEmail = async function (emailAddress: string) {
  try {
    const user = await User.findOne({ emailAddress }).populate("password");
    return user;
  } catch (err: any) {
    logger.error(err);
    throw err;
  }
};

export async function findUsers(
  findUsersDto: FindUsersDto,
  limit: number = 10,
  skip: number = 0
) {
  try {
    const userQuery = User.find();

    findUsersDto.firstName &&
      userQuery.where("firstName", findUsersDto.firstName);
    findUsersDto.lastName && userQuery.where("lastName", findUsersDto.lastName);
    findUsersDto.address && userQuery.where("address", findUsersDto.address);
    findUsersDto.contact && userQuery.where("contact", findUsersDto.contact);
    findUsersDto.isBlocked === true || findUsersDto.isBlocked === false
      ? userQuery.where("firstName", findUsersDto.firstName)
      : "";
    getSupportedAccounts().includes(findUsersDto.accountType as any) &&
      userQuery.where("accountType", findUsersDto.accountType);

    // Was getting query was already executed error, so had to duplicate to execute count query
    const countQuery = userQuery.clone();

    return {
      users: await userQuery.limit(limit).skip(skip).exec(),
      count: await countQuery.countDocuments(),
    };
  } catch (err: any) {
    logger.error(err);
    throw err;
  }
}
