import {
  EMAIL_ADDR_PATTERN,
  ACCOUNTS,
  HTTP_STATUS,
  SPLIT_PATTERN,
} from "./data";

export function extractTokenFromBearer(bearerToken: string) {
  if (!bearerToken.startsWith("Bearer ")) {
    throw new Error(
      `Invalid token provided.${SPLIT_PATTERN}${HTTP_STATUS.unauthorized}`
    );
  }
  return bearerToken.split(" ")[1];
}

export const getSupportedAccounts = () =>
  Object.entries(ACCOUNTS).map((account, _, _1) => account[1]);

export const emailIsValid = (emailAddress: string) =>
  EMAIL_ADDR_PATTERN.test(emailAddress);

export const contactIsValid = (contact: string) =>
  contact.length === 11 && contact.startsWith("0") && /^[0-9]+$/.test(contact);
