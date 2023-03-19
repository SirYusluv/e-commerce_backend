import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { Cart, IItemsInCart } from "../cart/cart.schema";
import { ItemType } from "../item/item.schema.";
import { UserType } from "../user/user.schema";
import { HTTP_STATUS, IResponse } from "../util/data";
import { Receipt, ReceiptType } from "./receipt.schema";

export async function postOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.body.user as UserType;
    const cart = await Cart.findOne({ owner: user._id }).populate(
      "items.itemId"
    );
    if (!cart || !cart.items) {
      const response: IResponse = {
        message: "No item to order in user's cart.",
        status: HTTP_STATUS.badRequest,
      };
      return res.status(response.status).json(response);
    }

    // check if the quantity the user requested is available
    cart.items.map(function ({ itemId, quantity }) {
      // i've populated itemId so it's type is actually Item
      const item = itemId as any as ItemType;
      if (quantity!! > item.remainingCount) {
        const response: IResponse = {
          message: `${item.itemName} quantity available is less than order count.`,
          status: HTTP_STATUS.badRequest,
        };
        return res.status(response.status).json(response);
      }
    });

    // depleted item, delete after ordering
    const itemsDepletedAfterOrdering: Types.ObjectId[] = [];

    // deduct the quantity requested from availble quantity
    cart.items.map(function ({ itemId, quantity }) {
      // i've populated itemId so it's type is actually Item
      const item = itemId as any as ItemType;
      item.remainingCount -= quantity!!;
      item.boughtByCount!! += quantity!!;

      // if item is depleted, delete
      if (item.boughtByCount!! < 1) {
        itemsDepletedAfterOrdering.push(item._id);
      }
    });

    // add item to user receipt, that's how we order
  } catch (err: any) {
    next(err);
  }
}
