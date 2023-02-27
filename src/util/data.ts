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
