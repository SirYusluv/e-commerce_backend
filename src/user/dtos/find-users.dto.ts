import {
  ACCOUNT_TYPES,
  ADDRESS_MIN_LENGTH,
  HTTP_STATUS,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MIN_LENHT,
  SPLIT_PATTERN,
} from "../../util/data";
import {
  contactIsValid,
  emailIsValid,
  getSupportedAccounts,
} from "../../util/helper";

export class FindUsersDto {
  firstName: string | null = null;
  lastName: string | null = null;
  address?: string | null = null;
  contact?: string | null = null;
  isBlocked?: boolean | null = null;
  accountType?: ACCOUNT_TYPES | null = null;

  constructor(
    firstName?: string,
    lastName?: string,
    address?: string,
    contact?: string,
    isBlocked?: boolean,
    accountType?: ACCOUNT_TYPES
  ) {
    this.setFirstName(firstName);
    this.setLastName(lastName);
    this.setAddress(address);
    this.setContact(contact);
    this.setIsBlocked(isBlocked);
    this.setAccountType(accountType);
  }

  private setFirstName(firstName?: string) {
    if (
      firstName &&
      (firstName.length < NAME_MIN_LENGTH || firstName.length > NAME_MAX_LENGTH)
    )
      throw new Error(
        `First name length must be within the range of ${NAME_MIN_LENGTH} - ${NAME_MAX_LENGTH}.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.firstName = firstName || null;
  }

  private setLastName(lastName?: string) {
    if (
      lastName &&
      (lastName.length < NAME_MIN_LENGTH || lastName.length > NAME_MAX_LENGTH)
    )
      throw new Error(
        `Last name length must be within the range of ${NAME_MIN_LENGTH} - ${NAME_MAX_LENGTH}.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.lastName = lastName || null;
  }

  private setAddress(address?: string) {
    if (address && address.length < ADDRESS_MIN_LENGTH)
      throw new Error(
        `Invalid address provided, address length is too small.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.address = address || null;
  }

  private setContact(contact?: string) {
    if (contact && !contactIsValid(contact))
      throw new Error(
        `Invalid contact provided.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.contact = contact || null;
  }

  private setIsBlocked(isBlocked?: boolean) {
    this.isBlocked = isBlocked ?? null;
  }

  private setAccountType(accountType?: ACCOUNT_TYPES) {
    if (accountType && !getSupportedAccounts().includes(accountType))
      throw new Error(
        `Unsupported account type provided.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.accountType = accountType;
  }
}
