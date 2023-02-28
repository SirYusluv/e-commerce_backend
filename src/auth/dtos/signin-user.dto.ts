import {
  EMAIL_ADDR_PATTERN,
  HTTP_STATUS,
  PASSWORD_MIN_LENHT,
  SPLIT_PATTERN,
} from "../../util/data";

export class SignInUserDto {
  emailAddress: string | null = null;
  password: string | null = null;

  constructor(emailAddress: string, password: string) {
    this.setEmailAddress(emailAddress || "");
    this.setPassword(password || "");
  }

  private setEmailAddress(emailAddress: string) {
    if (!emailAddress.match(EMAIL_ADDR_PATTERN))
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
}
