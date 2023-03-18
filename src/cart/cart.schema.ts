import { Document, model, Schema, Types } from "mongoose";

export type CartType = Document<unknown, any, ICart> &
  Omit<ICart & { _id: Types.ObjectId }, never>;

export interface IItemsInCart {
  itemId: Types.ObjectId;
  quantity?: number;
}

export interface ICart {
  owner: Types.ObjectId;
  items?: IItemsInCart[];
}

const itemsInCartSchema = new Schema<IItemsInCart>({
  itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
  quantity: { type: Number, default: 1 },
});

export const cartSchema = new Schema<ICart>({
  owner: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: "User",
    unique: true,
  },
  items: {
    type: [itemsInCartSchema],
    default: [],
  },
});

export const Cart = model<ICart>("Cart", cartSchema);
