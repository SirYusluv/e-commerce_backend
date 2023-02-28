import { HTTP_STATUS, SPLIT_PATTERN } from "../../util/data";

export class CreateUserDto {
  firstName: string | null = null;
  lastName: string | null = null;
  emailAddress: string | null = null;
  password: string | null = null;

  constructor(
    firstName?: string,
    lastName?: string,
    emailAddress?: string,
    password?: string
  ) {
    this.setFirstName(firstName || "");
    this.setLastName(lastName || "");
    this.setEmailAddress(emailAddress || "");
    this.setPassword(password || "");
  }

  private setFirstName(firstName: string) {
    if (firstName.length < 1 || firstName.length > 15)
      throw new Error(
        `First name length must be within the range of  - 15${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.firstName = firstName;
  }

  private setLastName(lastName: string) {
    if (lastName.length < 1 || lastName.length > 15)
      throw new Error(
        `Last name length must be within the range of  - 15${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.lastName = lastName;
  }

  private setEmailAddress(emailAddress: string) {
    if (
      !emailAddress.match(
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
      )
    )
      throw new Error(
        `Invalid email address provided${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.emailAddress = emailAddress;
  }

  private setPassword(password: string) {
    if (password.length < 7)
      throw new Error(
        `Password length must be greather than 7${SPLIT_PATTERN}${HTTP_STATUS.badRequest}`
      );
    this.password = password;
  }
}
