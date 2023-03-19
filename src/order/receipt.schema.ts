import { Document, model, Schema, Types } from "mongoose";

export type ReceiptType = Document<unknown, any, IReceipt> &
  Omit<IReceipt & { _id: Types.ObjectId }, never>;

interface IItemInReceipt {
  itemId: Types.ObjectId;
  itemName: string;
  priceEach: number;
  quantity: number;
}

interface IReceipt {
  owner: Types.ObjectId;
  datePaid: Date;
  paidBy: Types.ObjectId;
  items: IItemInReceipt[];
}

const itemInReceiptSchema = new Schema<IItemInReceipt>({
  itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
  itemName: { type: String, required: true },
  priceEach: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const receiptSchema = new Schema<IReceipt>({
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [itemInReceiptSchema], required: true },
  datePaid: { type: Date, default: Date.now },
});

export const Receipt = model<IReceipt>("Receipt", receiptSchema);
