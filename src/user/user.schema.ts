import { model, Schema } from "mongoose";
import { ACCOUNTS, ACCOUNT_TYPES, CREATED_BY, CREATOR } from "../util/data";

interface IUser {
  emailAddress: string;
  firstName: string;
  lastName: string;
  password: string;
  accountType: ACCOUNT_TYPES;
  createdBy: CREATED_BY;
  createdDate: Date;
}

const UserSchema = new Schema<IUser>({
  emailAddress: { type: String, unique: true, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true, select: 0 },
  accountType: { type: String, default: ACCOUNTS.user },
  createdBy: { type: String, default: CREATOR.self },
  createdDate: { type: Date, default: Date.now },
});

export const User = model<IUser>("User", UserSchema);
