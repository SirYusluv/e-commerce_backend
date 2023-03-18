import { Router } from "express";
import { addItemToCart } from "./cart.service";

export const CartRouter = Router();

CartRouter.post("/cart", addItemToCart);
