export const SPLIT_PATTERN = ":::";
export const BCRYPT_SALT = 12;
export const EMAIL_ADDR_PATTERN =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
export const PASSWORD_MIN_LENHT = 7;
export const NAME_MIN_LENGTH = 1;
export const NAME_MAX_LENGTH = 15;
export const ADDRESS_MIN_LENGTH = 2;

export const HTTP_STATUS = {
  ok: 200,
  created: 201,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  internalServerError: 500,
  conflict: 409,
};

export const MONGOOSE_STATUS = {
  duplicateError: 11000,
};

export const JWT_ERROR = {
  invalidSignature: "invalid signature",
  jwtMalformed: "jwt malformed",
};

export interface IResponse {
  message: string;
  status: number;
  [key: string]: any;
}

export type ACCOUNT_TYPES = "USER_ADMIN" | "USER" | "ACCOUNT" | "SALES";
export const ACCOUNTS: {
  userAdmin: ACCOUNT_TYPES;
  user: ACCOUNT_TYPES;
  account: ACCOUNT_TYPES;
  sales: ACCOUNT_TYPES;
} = {
  userAdmin: "USER_ADMIN",
  user: "USER",
  account: "ACCOUNT",
  sales: "SALES",
};

export type CREATED_BY = "SELF" | "USER_ADMIN";
export const CREATOR: { self: CREATED_BY; userAdmin: CREATED_BY } = {
  self: "SELF",
  userAdmin: "USER_ADMIN",
};
