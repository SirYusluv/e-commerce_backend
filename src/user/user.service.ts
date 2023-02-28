import { CreateUserDto } from "../auth/dtos/create-user.dto";
import { User } from "./user.schema";
import * as bcrypt from "bcrypt";
import {
  BCRYPT_SALT,
  HTTP_STATUS,
  MONGOOSE_STATUS,
  SPLIT_PATTERN,
} from "../util/data";
import { createLogManager } from "simple-node-logger";
import { ChangePasswordDto } from "../auth/dtos/change-password.dto";

const logger = createLogManager().createLogger("UserService.ts");

export const createUser = async function (createUserDto: CreateUserDto) {
  try {
    const user = new User(createUserDto);
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
