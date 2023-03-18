import { Document, model, Schema, Types } from "mongoose";

export type SaveType = Document<unknown, any, ISave> &
  Omit<ISave & { _id: Types.ObjectId }, never>;

export interface ISave {
  owner: Types.ObjectId;
  items?: Types.ObjectId[];
}

export const saveSchema = new Schema<ISave>({
  owner: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: "User",
    unique: true,
  },
  items: {
    type: [Types.ObjectId],
    ref: "Item",
    default: [],
  },
});

export const Save = model<ISave>("Save", saveSchema);
