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

export function getSupportedAccounts() {
  return Object.entries(ACCOUNTS).map((account, _, _1) => account[1]);
}

export function emailIsValid(emailAddress: string) {
  return EMAIL_ADDR_PATTERN.test(emailAddress);
}

export function contactIsValid(contact: string) {
  return (
    contact.length === 11 && contact.startsWith("0") && /^[0-9]+$/.test(contact)
  );
}
