import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { Item } from "../item/item.schema.";
import { UserType } from "../user/user.schema";
import { HTTP_STATUS, IResponse } from "../util/data";
import { Cart, CartType } from "./cart.schema";

export async function addItemToCart(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.body.user as UserType;
    const { itemId: itemIdStr, quantity: quantityStr } = req.body;
    const itemId = new Types.ObjectId(itemIdStr?.toString());
    const quantity = Number(quantityStr);

    if (!itemId || !quantity) {
      const response: IResponse = {
        message: "Quantity and item id must be provided",
        status: HTTP_STATUS.forbidden,
      };
      return res.status(response.status).json(response);
    }

    // check if item exist
    if (!(await Item.findOne({ _id: itemId }))) {
      const response: IResponse = {
        message: "Item does not exist.",
        status: HTTP_STATUS.ok,
      };
      return res.status(response.status).json(response);
    }

    let cart: CartType | null = null;

    // make sure user has a cart
    cart = await Cart.findOne({ owner: user._id });
    !cart && (cart = new Cart({ owner: user._id }));

    // if there is still no cart after trying to create
    if (!cart) {
      const response: IResponse = {
        message: "User's cart not found.",
        status: HTTP_STATUS.ok,
      };
      return res.status(response.status).json(response);
    }

    // cart does exist
    // add item to cart
    //first check if item is already in cart, then increase the quantity
    let isAdded = false; // item has been added to cart?
    cart.items!!.forEach(({ itemId: loopItemId }, index, arr) => {
      if (loopItemId.equals(itemId)) {
        arr[index].quantity!! += quantity || 1;
        isAdded = true;
      }
    });

    // if not found, add to cart
    if (!isAdded) {
      cart.items!!.push({ itemId, quantity });
    }
    await cart.save();

    const response: IResponse = {
      message: "Item successfully added to cart.",
      status: HTTP_STATUS.ok,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}

export async function removeItemFromCart(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const itemId = req.params.itemId;
    const all = req.query.all?.toString() === "true" ? true : false;
    const user = req.body.user as UserType;
    const _id = new Types.ObjectId(itemId);

    const userCart = await Cart.findOne({ owner: user._id });

    if (!userCart) {
      const response: IResponse = {
        message: "User's cart not found.",
        status: HTTP_STATUS.ok,
      };
      return res.status(response.status).json(response);
    }

    if (all) {
      userCart.items!!.forEach((item, i, cart) => {
        if (item.itemId.equals(itemId)) {
          cart.splice(i, 1);
        }
      });
    } else {
      userCart.items!!.forEach((item, i, cart) => {
        if (item.itemId.equals(itemId)) {
          cart[i].quantity!!--;
        }
      });
    }

    await userCart.save();
    const response: IResponse = {
      message: "Item removes successfully.",
      status: HTTP_STATUS.ok,
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.body.user as UserType;
    const response: IResponse = {
      message: "",
      status: HTTP_STATUS.ok,
      cart: await Cart.findOne({ owner: user._id }),
    };
    res.status(response.status).json(response);
  } catch (err: any) {
    next(err);
  }
}
