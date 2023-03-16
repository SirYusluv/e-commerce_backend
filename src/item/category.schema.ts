import { Document, model, Schema, Types } from "mongoose";

export interface ICategory {
  category: String;
  referencedCount?: number;
}

export type CategoryType = Document<unknown, any, ICategory> &
  Omit<ICategory & { _id: Types.ObjectId }, never>;

export const categorySchema = new Schema<ICategory>({
  category: { required: true, type: String, unique: true },
  referencedCount: { type: Number, default: 1 },
});

export const Category = model<ICategory>("Category", categorySchema);
