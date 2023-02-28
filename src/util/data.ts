export const SPLIT_PATTERN = ":::";
export const BCRYPT_SALT = 12;

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

export interface IResponse {
  message: string;
  status: number;
}

export type ACCOUNT_TYPES = "USER_ADMIN" | "USER" | "ACCOUNT" | "SALES";
export const ACCOUNTS: { [key: string]: ACCOUNT_TYPES } = {
  userAdmin: "USER_ADMIN",
  user: "USER",
  account: "ACCOUNT",
  sales: "SALES",
};

export type CREATED_BY = "SELF" | "USER_ADMIN";
export const CREATOR: { [key: string]: CREATED_BY } = {
  self: "SELF",
  userAdmin: "USER_ADMIN",
};
