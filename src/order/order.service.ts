import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { Cart, IItemsInCart } from "../cart/cart.schema";
import { Item, ItemType } from "../item/item.schema.";
import { UserType } from "../user/user.schema";
import { HTTP_STATUS, IResponse } from "../util/data";
import { IItemInReceipt, Receipt, ReceiptType } from "./receipt.schema";

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
    if (!cart || !cart.items?.length) {
      const response: IResponse = {
        message: "No item to order in user's cart.",
        status: HTTP_STATUS.badRequest,
      };
      return res.status(response.status).json(response);
    }

    // check if the quantity the user requested is available
    for (const { itemId, quantity } of cart.items) {
      // i've populated itemId so it's type is actually Item
      const item = itemId as any as ItemType;
      if (quantity!! > item.remainingCount) {
        const response: IResponse = {
          message: `${item.itemName} quantity available is less than order count.`,
          status: HTTP_STATUS.badRequest,
        };
        return res.status(response.status).json(response);
      }
    }

    // depleted item, delete after ordering
    const itemsDepletedAfterOrdering: Types.ObjectId[] = [];

    // deduct the quantity requested from availble quantity
    cart.items.map(function ({ itemId, quantity }) {
      // i've populated itemId so it's type is actually Item
      const item = itemId as any as ItemType;
      item.remainingCount -= quantity!!;
      item.boughtByCount!! += quantity!!;

      // if item is depleted, delete
      if (item.remainingCount!! < 1) {
        itemsDepletedAfterOrdering.push(item._id);
      }
    });
    // fetch the real item from db and update it
    cart.items.map(function ({ itemId, quantity }) {
      // i've populated itemId so it's type is actually Item
      const item = itemId as any as ItemType;
      Item.findByIdAndUpdate(item._id, {
        remainingCount: item.remainingCount,
        boughtByCount: item.boughtByCount,
      }).exec();
    });

    // remove item from db if item has finished: itemsDepletedAfterOrdering
    itemsDepletedAfterOrdering.map((_id) => Item.findByIdAndDelete(_id).exec());

    // add item to user receipt, that's how we order
    const itemsInCart: IItemInReceipt[] = [];
    cart.items.map(function ({ itemId, quantity }, i) {
      // i've populated itemId so it's type is actually Item
      const item = itemId as any as ItemType;
      itemsInCart.push({
        itemId: item._id,
        itemName: item.itemName,
        priceEach: item.price,
        quantity: quantity!!,
      });
    });
    const receipt = new Receipt({
      owner: user._id,
      paidBy: user._id,
      items: itemsInCart,
    });

    // empty user's cart and save cart and receipt
    cart.items = [];
    await cart.save();
    await receipt.save();

    const response: IResponse = {
      message: "Order successfull.",
      status: HTTP_STATUS.ok,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}
