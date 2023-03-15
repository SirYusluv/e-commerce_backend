import {
  ADDRESS_MIN_LENGTH,
  HTTP_STATUS,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MIN_LENHT,
  SPLIT_PATTERN,
} from "../../util/data";
import { contactIsValid, emailIsValid } from "../../util/helper";

export class ModifyUserDto {
  firstName: string | null = null;
  lastName: string | null = null;
  emailAddress: string | null = null;
  password: string | null = null;
  address: string | null = null;
  contact: string | null = null;
  isBlocked: boolean | null = null;

  constructor(
    firstName?: string,
    lastName?: string,
    emailAddress?: string,
    password?: string,
    address?: string,
    contact?: string,
    isBlocked?: boolean
  ) {
    this.setFirstName(firstName);
    this.setLastName(lastName);
    this.setEmailAddress(emailAddress);
    this.setPassword(password);
    this.setAddress(address);
    this.setContact(contact);
    this.setIsBlocked(isBlocked);
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

  private setEmailAddress(emailAddress?: string) {
    if (emailAddress && !emailIsValid(emailAddress))
      throw new Error(
        `Invalid email address provided.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.emailAddress = emailAddress || null;
  }

  private setPassword(password?: string) {
    if (password && password.length < PASSWORD_MIN_LENHT)
      throw new Error(
        `Password length must be greather than ${PASSWORD_MIN_LENHT}.${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.password = password || null;
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
}
