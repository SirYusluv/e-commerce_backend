import { model, Schema } from "mongoose";
import { ACCOUNT_TYPES, CREATED_BY } from "../util/data";

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
  password: { type: String, required: true },
  accountType: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
});

const User = model<IUser>("User", UserSchema);
