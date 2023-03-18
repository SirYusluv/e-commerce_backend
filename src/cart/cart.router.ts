import { Router } from "express";
import { addItemToCart, getCart, removeItemFromCart } from "./cart.service";

export const CartRouter = Router();

CartRouter.post("/cart", addItemToCart);

CartRouter.delete("/cart/:itemId", removeItemFromCart);

CartRouter.get("/cart", getCart);
