import { Document, model, Schema, Types } from "mongoose";

export type ItemType = Document<unknown, any, IItem> &
  Omit<IItem & { _id: Types.ObjectId }, never>;

export interface IItem {
  itemName: string;
  price: number;
  images: [string, string, string];
  itemDescription1: string;
  itemDescription2?: string;
  remainingCount: number;
  addedBy: Types.ObjectId;
  categories: Types.ObjectId[];
  boughtByCount?: number;
  dateAdded?: Date;
}

export const itemSchema = new Schema<IItem>({
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true },
  itemDescription1: { type: String, required: true },
  itemDescription2: String,
  remainingCount: { type: Number, required: true },
  addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  categories: {
    type: [Schema.Types.ObjectId],
    ref: "Category",
    required: true,
  },
  boughtByCount: { type: Number, default: 0 },
  dateAdded: { type: Date, default: Date.now },
});

export const Item = model<IItem>("Item", itemSchema);
