import {
  ACCOUNTS,
  ACCOUNT_TYPES,
  EMAIL_ADDR_PATTERN,
  HTTP_STATUS,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MIN_LENHT,
  SPLIT_PATTERN,
} from "../../util/data";
import { emailIsValid, getSupportedAccounts } from "../../util/helper";

export class UserAdminCreateUserDto {
  firstName: string | null = null;
  lastName: string | null = null;
  emailAddress: string | null = null;
  password: string | null = null;
  accountType: ACCOUNT_TYPES | null = null;

  constructor(
    firstName?: string,
    lastName?: string,
    emailAddress?: string,
    password?: string,
    accountType?: ACCOUNT_TYPES
  ) {
    this.setFirstName(firstName || "");
    this.setLastName(lastName || "");
    this.setEmailAddress(emailAddress || "");
    this.setPassword(password || "");
    this.setAccountType(accountType || ACCOUNTS.user);
  }

  private setFirstName(firstName: string) {
    if (
      firstName.length < NAME_MIN_LENGTH ||
      firstName.length > NAME_MAX_LENGTH
    )
      throw new Error(
        `First name length must be within the range of ${NAME_MIN_LENGTH} - ${NAME_MAX_LENGTH}.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.firstName = firstName;
  }

  private setLastName(lastName: string) {
    if (lastName.length < NAME_MIN_LENGTH || lastName.length > NAME_MAX_LENGTH)
      throw new Error(
        `Last name length must be within the range of ${NAME_MIN_LENGTH} - ${NAME_MAX_LENGTH}.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.lastName = lastName;
  }

  private setEmailAddress(emailAddress: string) {
    if (!emailIsValid(emailAddress))
      throw new Error(
        `Invalid email address provided.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.emailAddress = emailAddress;
  }

  private setPassword(password: string) {
    if (password.length < PASSWORD_MIN_LENHT)
      throw new Error(
        `Password length must be greather than ${PASSWORD_MIN_LENHT}.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.password = password;
  }

  private setAccountType(accountType: ACCOUNT_TYPES) {
    if (!getSupportedAccounts().includes(accountType))
      throw new Error(
        `Invalid account type provided.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.accountType = accountType;
  }
}
